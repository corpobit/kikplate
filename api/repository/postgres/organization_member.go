package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	"gorm.io/gorm"
)

type organizationMemberRepository struct {
	db *gorm.DB
}

func NewOrganizationMemberRepository(db lib.Database) repository.OrganizationMemberRepository {
	return &organizationMemberRepository{db: db.DB}
}

func (r *organizationMemberRepository) Create(ctx context.Context, member *model.OrganizationMember) error {
	return r.db.WithContext(ctx).Create(member).Error
}

func (r *organizationMemberRepository) GetByOrganizationAndAccount(ctx context.Context, organizationID, accountID uuid.UUID) (*model.OrganizationMember, error) {
	var member model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND account_id = ?", organizationID, accountID).
		First(&member).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *organizationMemberRepository) ListByOrganization(ctx context.Context, organizationID uuid.UUID) ([]*model.OrganizationMember, error) {
	var members []*model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ?", organizationID).
		Order("created_at ASC").
		Find(&members).Error
	return members, err
}

func (r *organizationMemberRepository) ListByAccount(ctx context.Context, accountID uuid.UUID) ([]*model.OrganizationMember, error) {
	var members []*model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("account_id = ?", accountID).
		Order("created_at DESC").
		Find(&members).Error
	return members, err
}

func (r *organizationMemberRepository) Update(ctx context.Context, member *model.OrganizationMember) error {
	return r.db.WithContext(ctx).Save(member).Error
}

func (r *organizationMemberRepository) Delete(ctx context.Context, organizationID, accountID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Delete(&model.OrganizationMember{}, "organization_id = ? AND account_id = ?", organizationID, accountID).Error
}
