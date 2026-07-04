package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	"gorm.io/gorm"
)

type billingSubscriptionRepository struct {
	db *gorm.DB
}

func NewBillingSubscriptionRepository(db lib.Database) repository.BillingSubscriptionRepository {
	return &billingSubscriptionRepository{db: db.DB}
}

func (r *billingSubscriptionRepository) GetByAccountID(ctx context.Context, accountID uuid.UUID) (*model.BillingSubscription, error) {
	sub := &model.BillingSubscription{}
	result := r.db.WithContext(ctx).Where("account_id = ?", accountID).First(sub)
	if result.Error == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return sub, result.Error
}

func (r *billingSubscriptionRepository) GetByStripeCustomerID(ctx context.Context, customerID string) (*model.BillingSubscription, error) {
	sub := &model.BillingSubscription{}
	result := r.db.WithContext(ctx).Where("stripe_customer_id = ?", customerID).First(sub)
	if result.Error == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return sub, result.Error
}

func (r *billingSubscriptionRepository) UpsertByAccountID(ctx context.Context, sub *model.BillingSubscription) error {
	existing, err := r.GetByAccountID(ctx, sub.AccountID)
	if err != nil {
		return err
	}
	if existing == nil {
		return r.db.WithContext(ctx).Create(sub).Error
	}
	existing.PlanCode = sub.PlanCode
	existing.Status = sub.Status
	existing.StripeCustomerID = sub.StripeCustomerID
	existing.StripeSubscriptionID = sub.StripeSubscriptionID
	existing.StripeProductID = sub.StripeProductID
	existing.StripePriceID = sub.StripePriceID
	existing.CancelAtPeriodEnd = sub.CancelAtPeriodEnd
	existing.CurrentPeriodStart = sub.CurrentPeriodStart
	existing.CurrentPeriodEnd = sub.CurrentPeriodEnd
	return r.db.WithContext(ctx).Save(existing).Error
}
