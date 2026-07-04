package postgres

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	"gorm.io/gorm"
)

type organizationInvitationRepository struct {
	db *gorm.DB
}

func NewOrganizationInvitationRepository(db lib.Database) repository.OrganizationInvitationRepository {
	return &organizationInvitationRepository{db: db.DB}
}

func (r *organizationInvitationRepository) Create(ctx context.Context, invitation *model.OrganizationInvitation) error {
	invitation.Email = strings.ToLower(strings.TrimSpace(invitation.Email))
	return r.db.WithContext(ctx).Create(invitation).Error
}

func (r *organizationInvitationRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.OrganizationInvitation, error) {
	var invitation model.OrganizationInvitation
	err := r.db.WithContext(ctx).First(&invitation, "id = ?", id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

func (r *organizationInvitationRepository) ListByEmail(ctx context.Context, email string) ([]*model.OrganizationInvitation, error) {
	var invitations []*model.OrganizationInvitation
	err := r.db.WithContext(ctx).
		Where("lower(email) = ?", strings.ToLower(strings.TrimSpace(email))).
		Where("status = ?", model.OrganizationInvitationStatusPending).
		Order("created_at DESC").
		Find(&invitations).Error
	return invitations, err
}

func (r *organizationInvitationRepository) ListByOrganization(ctx context.Context, organizationID uuid.UUID) ([]*model.OrganizationInvitation, error) {
	var invitations []*model.OrganizationInvitation
	err := r.db.WithContext(ctx).
		Where("organization_id = ?", organizationID).
		Order("created_at DESC").
		Find(&invitations).Error
	return invitations, err
}

func (r *organizationInvitationRepository) Update(ctx context.Context, invitation *model.OrganizationInvitation) error {
	return r.db.WithContext(ctx).Save(invitation).Error
}

func (r *organizationInvitationRepository) DeleteByID(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&model.OrganizationInvitation{}, "id = ?", id).Error
}

func (r *organizationInvitationRepository) DeleteExpiredPending(ctx context.Context) error {
	return r.db.WithContext(ctx).
		Where("status = ? AND expires_at <= ?", model.OrganizationInvitationStatusPending, time.Now()).
		Delete(&model.OrganizationInvitation{}).Error
}
