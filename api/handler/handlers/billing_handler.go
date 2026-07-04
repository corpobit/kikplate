package handlers

import (
	"io"
	"net/http"

	"github.com/kickplate/api/handler/middleware"
	"github.com/kickplate/api/service/billing"
)

type BillingHandler struct {
	billing billing.BillingService
}

func NewBillingHandler(billing billing.BillingService) BillingHandler {
	return BillingHandler{billing: billing}
}

func (h BillingHandler) CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	checkoutURL, err := h.billing.CreateCheckoutSession(r.Context(), accountID)
	if err != nil {
		respondServiceError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"checkout_url": checkoutURL})
}

func (h BillingHandler) CreatePortalSession(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	portalURL, err := h.billing.CreatePortalSession(r.Context(), accountID)
	if err != nil {
		respondServiceError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"portal_url": portalURL})
}

func (h BillingHandler) Me(w http.ResponseWriter, r *http.Request) {
	accountID, ok := middleware.GetAccountID(r.Context())
	if !ok {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	result, err := h.billing.GetAccountBilling(r.Context(), accountID)
	if err != nil {
		respondServiceError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, result)
}

func (h BillingHandler) Pricing(w http.ResponseWriter, r *http.Request) {
	result, err := h.billing.GetPremiumPricing(r.Context())
	if err != nil {
		respondServiceError(w, err)
		return
	}
	respondJSON(w, http.StatusOK, result)
}

func (h BillingHandler) StripeWebhook(w http.ResponseWriter, r *http.Request) {
	payload, err := io.ReadAll(r.Body)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid webhook payload")
		return
	}
	signature := r.Header.Get("Stripe-Signature")
	if signature == "" {
		respondError(w, http.StatusBadRequest, "missing stripe signature")
		return
	}

	if err := h.billing.HandleWebhook(r.Context(), payload, signature); err != nil {
		respondServiceError(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
}
