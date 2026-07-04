package model

import (
	"time"

	"github.com/google/uuid"
)

type OrganizationInvitationStatus string

const (
	OrganizationInvitationStatusPending  OrganizationInvitationStatus = "pending"
	OrganizationInvitationStatusAccepted OrganizationInvitationStatus = "accepted"
	OrganizationInvitationStatusDeclined OrganizationInvitationStatus = "declined"
)

type OrganizationInvitation struct {
	ID             uuid.UUID                    `gorm:"type:uuid;primaryKey" json:"id"`
	OrganizationID uuid.UUID                    `gorm:"type:uuid;not null;index" json:"organization_id"`
	InvitedBy      uuid.UUID                    `gorm:"type:uuid;not null;index" json:"invited_by"`
	Email          string                       `gorm:"size:320;not null;index" json:"email"`
	Role           OrganizationMemberRole       `gorm:"type:varchar(20);not null" json:"role"`
	Status         OrganizationInvitationStatus `gorm:"type:varchar(20);not null;index" json:"status"`
	ExpiresAt      time.Time                    `gorm:"not null;index" json:"expires_at"`
	CreatedAt      time.Time                    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time                    `gorm:"autoUpdateTime" json:"updated_at"`

	Organization *Organization `gorm:"foreignKey:OrganizationID" json:"-"`
}

func (OrganizationInvitation) TableName() string {
	return "organization_invitation"
}
