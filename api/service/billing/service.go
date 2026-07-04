package billing

import (
	"context"
	"encoding/json"
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	"github.com/stripe/stripe-go/v82"
	billingportalsession "github.com/stripe/stripe-go/v82/billingportal/session"
	checkoutsession "github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/customer"
	stripeprice "github.com/stripe/stripe-go/v82/price"
	"github.com/stripe/stripe-go/v82/subscription"
	"github.com/stripe/stripe-go/v82/webhook"
)

const (
	PlanFree             = "free"
	PlanPremium          = "premium"
	FeaturePrivateOrg    = "private_organization"
	stripeStatusActive   = "active"
	stripeStatusTrialing = "trialing"
)

var (
	ErrBillingNotConfigured = errors.New("billing is not configured")
	ErrBillingUnauthorized  = errors.New("billing account not found")
	ErrBillingInvalidConfig = errors.New("billing configuration is invalid")
	ErrSubscriptionRequired = errors.New("subscription is required")
)

type AccountBilling struct {
	PlanCode             string     `json:"plan_code"`
	Status               string     `json:"status"`
	HasPremium           bool       `json:"has_premium"`
	Features             []string   `json:"features"`
	StripeCustomerID     string     `json:"stripe_customer_id,omitempty"`
	StripeSubscriptionID string     `json:"stripe_subscription_id,omitempty"`
	CurrentPeriodEnd     *time.Time `json:"current_period_end,omitempty"`
}

type PremiumPricing struct {
	PriceID   string `json:"price_id"`
	Currency  string `json:"currency"`
	Amount    int64  `json:"amount"`
	Interval  string `json:"interval"`
	IntervalCount int64 `json:"interval_count"`
}

type BillingService interface {
	IsConfigured() bool
	CreateCheckoutSession(ctx context.Context, accountID uuid.UUID) (string, error)
	CreatePortalSession(ctx context.Context, accountID uuid.UUID) (string, error)
	HandleWebhook(ctx context.Context, payload []byte, signature string) error
	GetAccountBilling(ctx context.Context, accountID uuid.UUID) (*AccountBilling, error)
	HasFeature(ctx context.Context, accountID uuid.UUID, feature string) (bool, error)
	GetPremiumPricing(ctx context.Context) (*PremiumPricing, error)
}

type billingService struct {
	env      lib.Env
	logger   lib.Logger
	accounts repository.AccountRepository
	users    repository.UserRepository
	subs     repository.BillingSubscriptionRepository
	events   repository.BillingWebhookEventRepository
}

func NewBillingService(
	env lib.Env,
	logger lib.Logger,
	accounts repository.AccountRepository,
	users repository.UserRepository,
	subs repository.BillingSubscriptionRepository,
	events repository.BillingWebhookEventRepository,
) BillingService {
	if env.Stripe.SecretKey != "" {
		stripe.Key = env.Stripe.SecretKey
	}
	return &billingService{
		env:      env,
		logger:   logger,
		accounts: accounts,
		users:    users,
		subs:     subs,
		events:   events,
	}
}

func (s *billingService) IsConfigured() bool {
	if strings.TrimSpace(s.env.Stripe.SecretKey) == "" {
		return false
	}
	if strings.TrimSpace(s.env.Stripe.PremiumPriceID) == "" {
		return false
	}
	if strings.TrimSpace(s.env.Stripe.CheckoutSuccessURL) == "" || strings.TrimSpace(s.env.Stripe.CheckoutCancelURL) == "" {
		return false
	}
	return true
}

func (s *billingService) CreateCheckoutSession(ctx context.Context, accountID uuid.UUID) (string, error) {
	if !s.IsConfigured() {
		return "", ErrBillingNotConfigured
	}
	if !strings.HasPrefix(s.env.Stripe.PremiumPriceID, "price_") {
		return "", ErrBillingInvalidConfig
	}
	if _, err := url.ParseRequestURI(s.env.Stripe.CheckoutSuccessURL); err != nil {
		return "", ErrBillingInvalidConfig
	}
	if _, err := url.ParseRequestURI(s.env.Stripe.CheckoutCancelURL); err != nil {
		return "", ErrBillingInvalidConfig
	}

	customerID, customerEmail, err := s.ensureCustomer(ctx, accountID)
	if err != nil {
		return "", err
	}

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL: stripe.String(s.env.Stripe.CheckoutSuccessURL),
		CancelURL:  stripe.String(s.env.Stripe.CheckoutCancelURL),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(s.env.Stripe.PremiumPriceID),
				Quantity: stripe.Int64(1),
			},
		},
		AllowPromotionCodes: stripe.Bool(true),
		ClientReferenceID:   stripe.String(accountID.String()),
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Metadata: map[string]string{
				"account_id": accountID.String(),
			},
		},
	}

	if customerID != "" {
		params.Customer = stripe.String(customerID)
	} else if customerEmail != "" {
		params.CustomerEmail = stripe.String(customerEmail)
	}

	session, err := checkoutsession.New(params)
	if err != nil {
		return "", err
	}

	return session.URL, nil
}

func (s *billingService) CreatePortalSession(ctx context.Context, accountID uuid.UUID) (string, error) {
	if strings.TrimSpace(s.env.Stripe.SecretKey) == "" {
		return "", ErrBillingNotConfigured
	}
	if strings.TrimSpace(s.env.Stripe.PortalReturnURL) == "" {
		return "", ErrBillingInvalidConfig
	}
	if _, err := url.ParseRequestURI(s.env.Stripe.PortalReturnURL); err != nil {
		return "", ErrBillingInvalidConfig
	}

	customerID, _, err := s.ensureCustomer(ctx, accountID)
	if err != nil {
		return "", err
	}
	if customerID == "" {
		return "", ErrSubscriptionRequired
	}

	portalSession, err := billingportalsession.New(&stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(s.env.Stripe.PortalReturnURL),
	})
	if err != nil {
		return "", err
	}

	return portalSession.URL, nil
}

func (s *billingService) HandleWebhook(ctx context.Context, payload []byte, signature string) error {
	if strings.TrimSpace(s.env.Stripe.WebhookSecret) == "" {
		return ErrBillingNotConfigured
	}
	event, err := webhook.ConstructEvent(payload, signature, s.env.Stripe.WebhookSecret)
	if err != nil {
		return err
	}

	existing, err := s.events.GetByEventID(ctx, event.ID)
	if err != nil {
		return err
	}
	if existing != nil {
		return nil
	}

	if err := s.processEvent(ctx, event); err != nil {
		return err
	}

	return s.events.Create(ctx, &model.BillingWebhookEvent{
		EventID:   event.ID,
		EventType: string(event.Type),
	})
}

func (s *billingService) processEvent(ctx context.Context, event stripe.Event) error {
	switch event.Type {
	case "checkout.session.completed":
		var payload struct {
			Subscription string `json:"subscription"`
		}
		if err := json.Unmarshal(event.Data.Raw, &payload); err != nil {
			return err
		}
		if strings.TrimSpace(payload.Subscription) == "" {
			return nil
		}
		return s.syncSubscriptionByID(ctx, payload.Subscription)
	case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
		var payload stripeSubscriptionPayload
		if err := json.Unmarshal(event.Data.Raw, &payload); err != nil {
			return err
		}
		return s.upsertFromPayload(ctx, payload)
	case "invoice.paid", "invoice.payment_failed":
		var payload struct {
			Subscription string `json:"subscription"`
		}
		if err := json.Unmarshal(event.Data.Raw, &payload); err != nil {
			return err
		}
		if strings.TrimSpace(payload.Subscription) == "" {
			return nil
		}
		return s.syncSubscriptionByID(ctx, payload.Subscription)
	default:
		return nil
	}
}

func (s *billingService) syncSubscriptionByID(ctx context.Context, subscriptionID string) error {
	sub, err := subscription.Get(subscriptionID, nil)
	if err != nil {
		return err
	}
	raw, err := json.Marshal(sub)
	if err != nil {
		return err
	}
	var payload stripeSubscriptionPayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return err
	}
	return s.upsertFromPayload(ctx, payload)
}

type stripeSubscriptionItemPayload struct {
	Price stripePricePayload `json:"price"`
}

type stripePricePayload struct {
	ID      string `json:"id"`
	Product string `json:"product"`
}

type stripeSubscriptionPayload struct {
	ID                 string            `json:"id"`
	Customer           string            `json:"customer"`
	Status             string            `json:"status"`
	CancelAtPeriodEnd  bool              `json:"cancel_at_period_end"`
	CurrentPeriodStart int64             `json:"current_period_start"`
	CurrentPeriodEnd   int64             `json:"current_period_end"`
	Metadata           map[string]string `json:"metadata"`
	Items              struct {
		Data []stripeSubscriptionItemPayload `json:"data"`
	} `json:"items"`
}

func (s *billingService) upsertFromPayload(ctx context.Context, payload stripeSubscriptionPayload) error {
	accountID := uuid.Nil
	if rawID, ok := payload.Metadata["account_id"]; ok && strings.TrimSpace(rawID) != "" {
		parsed, err := uuid.Parse(rawID)
		if err == nil {
			accountID = parsed
		}
	}
	if accountID == uuid.Nil && strings.TrimSpace(payload.Customer) != "" {
		existing, err := s.subs.GetByStripeCustomerID(ctx, payload.Customer)
		if err != nil {
			return err
		}
		if existing != nil {
			accountID = existing.AccountID
		}
	}
	if accountID == uuid.Nil {
		return nil
	}

	planCode := PlanFree
	priceID := ""
	productID := ""
	for _, item := range payload.Items.Data {
		if strings.TrimSpace(item.Price.ID) != "" {
			priceID = item.Price.ID
		}
		if strings.TrimSpace(item.Price.Product) != "" {
			productID = item.Price.Product
		}
		if item.Price.ID == s.env.Stripe.PremiumPriceID {
			planCode = PlanPremium
		}
	}

	var periodStart *time.Time
	if payload.CurrentPeriodStart > 0 {
		t := time.Unix(payload.CurrentPeriodStart, 0).UTC()
		periodStart = &t
	}
	var periodEnd *time.Time
	if payload.CurrentPeriodEnd > 0 {
		t := time.Unix(payload.CurrentPeriodEnd, 0).UTC()
		periodEnd = &t
	}

	return s.subs.UpsertByAccountID(ctx, &model.BillingSubscription{
		ID:                   uuid.New(),
		AccountID:            accountID,
		PlanCode:             planCode,
		Status:               payload.Status,
		StripeCustomerID:     payload.Customer,
		StripeSubscriptionID: payload.ID,
		StripeProductID:      productID,
		StripePriceID:        priceID,
		CancelAtPeriodEnd:    payload.CancelAtPeriodEnd,
		CurrentPeriodStart:   periodStart,
		CurrentPeriodEnd:     periodEnd,
	})
}

func (s *billingService) GetAccountBilling(ctx context.Context, accountID uuid.UUID) (*AccountBilling, error) {
	sub, err := s.subs.GetByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if sub == nil {
		return &AccountBilling{
			PlanCode:   PlanFree,
			Status:     "none",
			HasPremium: false,
			Features:   []string{},
		}, nil
	}
	features := s.featuresFor(sub.PlanCode, sub.Status)
	return &AccountBilling{
		PlanCode:             sub.PlanCode,
		Status:               sub.Status,
		HasPremium:           contains(features, FeaturePrivateOrg),
		Features:             features,
		StripeCustomerID:     sub.StripeCustomerID,
		StripeSubscriptionID: sub.StripeSubscriptionID,
		CurrentPeriodEnd:     sub.CurrentPeriodEnd,
	}, nil
}

func (s *billingService) HasFeature(ctx context.Context, accountID uuid.UUID, feature string) (bool, error) {
	billing, err := s.GetAccountBilling(ctx, accountID)
	if err != nil {
		return false, err
	}
	return contains(billing.Features, feature), nil
}

func (s *billingService) GetPremiumPricing(ctx context.Context) (*PremiumPricing, error) {
	if strings.TrimSpace(s.env.Stripe.SecretKey) == "" || strings.TrimSpace(s.env.Stripe.PremiumPriceID) == "" {
		return nil, ErrBillingNotConfigured
	}
	if !strings.HasPrefix(s.env.Stripe.PremiumPriceID, "price_") {
		return nil, ErrBillingInvalidConfig
	}
	result, err := stripeprice.Get(s.env.Stripe.PremiumPriceID, nil)
	if err != nil {
		return nil, err
	}
	interval := ""
	intervalCount := int64(0)
	if result.Recurring != nil {
		interval = string(result.Recurring.Interval)
		intervalCount = result.Recurring.IntervalCount
	}
	return &PremiumPricing{
		PriceID:   result.ID,
		Currency:  strings.ToUpper(string(result.Currency)),
		Amount:    result.UnitAmount,
		Interval:  interval,
		IntervalCount: intervalCount,
	}, nil
}

func (s *billingService) ensureCustomer(ctx context.Context, accountID uuid.UUID) (string, string, error) {
	sub, err := s.subs.GetByAccountID(ctx, accountID)
	if err != nil {
		return "", "", err
	}
	if sub != nil && strings.TrimSpace(sub.StripeCustomerID) != "" {
		return sub.StripeCustomerID, "", nil
	}

	account, err := s.accounts.GetByID(ctx, accountID)
	if err != nil {
		return "", "", err
	}
	if account == nil {
		return "", "", ErrBillingUnauthorized
	}

	email := ""
	if account.UserID != nil {
		user, userErr := s.users.GetByID(ctx, *account.UserID)
		if userErr != nil {
			return "", "", userErr
		}
		if user != nil {
			email = strings.TrimSpace(user.Email)
		}
	}

	if email == "" {
		return "", "", nil
	}

	params := &stripe.CustomerParams{Metadata: map[string]string{"account_id": accountID.String()}}
	params.Email = stripe.String(email)
	created, err := customer.New(params)
	if err != nil {
		return "", "", err
	}

	if sub == nil {
		err = s.subs.UpsertByAccountID(ctx, &model.BillingSubscription{
			ID:               uuid.New(),
			AccountID:        accountID,
			PlanCode:         PlanFree,
			Status:           "none",
			StripeCustomerID: created.ID,
		})
		if err != nil {
			return "", "", err
		}
		return created.ID, email, nil
	}

	sub.StripeCustomerID = created.ID
	if err := s.subs.UpsertByAccountID(ctx, sub); err != nil {
		return "", "", err
	}
	return created.ID, email, nil
}

func (s *billingService) featuresFor(planCode, status string) []string {
	if planCode != PlanPremium {
		return []string{}
	}
	if status != stripeStatusActive && status != stripeStatusTrialing {
		return []string{}
	}
	return []string{FeaturePrivateOrg}
}

func contains(values []string, target string) bool {
	for _, v := range values {
		if v == target {
			return true
		}
	}
	return false
}
