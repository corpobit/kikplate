package model

import "time"

type BillingWebhookEvent struct {
	EventID     string    `gorm:"size:255;primaryKey" json:"event_id"`
	EventType   string    `gorm:"size:255;not null" json:"event_type"`
	ProcessedAt time.Time `gorm:"autoCreateTime" json:"processed_at"`
}

func (BillingWebhookEvent) TableName() string {
	return "billing_webhook_event"
}
