package postgres
package postgres

import (
	"context"

	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	"gorm.io/gorm"
)

type billingWebhookEventRepository struct {
	db *gorm.DB
}

func NewBillingWebhookEventRepository(db lib.Database) repository.BillingWebhookEventRepository {
	return &billingWebhookEventRepository{db: db.DB}
}

func (r *billingWebhookEventRepository) GetByEventID(ctx context.Context, eventID string) (*model.BillingWebhookEvent, error) {
	evt := &model.BillingWebhookEvent{}
	result := r.db.WithContext(ctx).Where("event_id = ?", eventID).First(evt)
	if result.Error == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return evt, result.Error
}

func (r *billingWebhookEventRepository) Create(ctx context.Context, event *model.BillingWebhookEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}
