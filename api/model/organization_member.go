package model

import (
	"time"

	"github.com/google/uuid"
)

type OrganizationMemberRole string

type OrganizationMemberStatus string

const (
	OrganizationVisibilityPublic  = "public"
	OrganizationVisibilityPrivate = "private"
)

const (
	OrganizationMemberRoleOwner  OrganizationMemberRole = "owner"
	OrganizationMemberRoleAdmin  OrganizationMemberRole = "admin"
	OrganizationMemberRoleMember OrganizationMemberRole = "member"
)

const (
	OrganizationMemberStatusPending  OrganizationMemberStatus = "pending"
	OrganizationMemberStatusAccepted OrganizationMemberStatus = "accepted"
	OrganizationMemberStatusDeclined OrganizationMemberStatus = "declined"
)

type OrganizationMember struct {
	ID             uuid.UUID                `gorm:"type:uuid;primaryKey" json:"id"`
	OrganizationID uuid.UUID                `gorm:"type:uuid;not null;index" json:"organization_id"`
	AccountID      uuid.UUID                `gorm:"type:uuid;not null;index" json:"account_id"`
	Role           OrganizationMemberRole   `gorm:"type:varchar(20);not null" json:"role"`
	Status         OrganizationMemberStatus `gorm:"type:varchar(20);not null;index" json:"status"`
	CreatedAt      time.Time                `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time                `gorm:"autoUpdateTime" json:"updated_at"`

	Organization *Organization `gorm:"foreignKey:OrganizationID" json:"-"`
	Account      *Account      `gorm:"foreignKey:AccountID" json:"-"`
}

func (OrganizationMember) TableName() string {
	return "organization_member"
}
