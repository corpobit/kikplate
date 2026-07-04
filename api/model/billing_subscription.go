package model

import (
	"time"

	"github.com/google/uuid"
)

type BillingSubscription struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	AccountID            uuid.UUID  `gorm:"type:uuid;uniqueIndex;not null" json:"account_id"`
	PlanCode             string     `gorm:"size:64;not null" json:"plan_code"`
	Status               string     `gorm:"size:64;not null" json:"status"`
	StripeCustomerID     string     `gorm:"size:255;index" json:"stripe_customer_id"`
	StripeSubscriptionID string     `gorm:"size:255;index" json:"stripe_subscription_id"`
	StripeProductID      string     `gorm:"size:255" json:"stripe_product_id"`
	StripePriceID        string     `gorm:"size:255" json:"stripe_price_id"`
	CancelAtPeriodEnd    bool       `gorm:"default:false" json:"cancel_at_period_end"`
	CurrentPeriodStart   *time.Time `json:"current_period_start,omitempty"`
	CurrentPeriodEnd     *time.Time `json:"current_period_end,omitempty"`
	CreatedAt            time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (BillingSubscription) TableName() string {
	return "billing_subscription"
}
