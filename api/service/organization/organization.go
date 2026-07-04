package organization

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kickplate/api/events"
	"github.com/kickplate/api/lib"
	"github.com/kickplate/api/model"
	"github.com/kickplate/api/repository"
	"github.com/kickplate/api/service/billing"
)

var (
	ErrNameTaken                 = errors.New("organization name already taken")
	ErrNotOwner                  = errors.New("only organization owner can perform this action")
	ErrNotMember                 = errors.New("you are not a member of this organization")
	ErrOwnerCannotLeave          = errors.New("organization owner cannot leave their own organization")
	ErrOwnerCannotBeRemoved      = errors.New("organization owner cannot be removed")
	ErrHasPlates                 = errors.New("cannot delete organization that contains plates")
	ErrNotFound                  = errors.New("organization not found")
	ErrNameRequired              = errors.New("organization name is required")
	ErrInvalidVisibility         = errors.New("invalid organization visibility")
	ErrInviteEmailInvalid        = errors.New("invite email is required")
	ErrInviteNotFound            = errors.New("invitation not found")
	ErrInviteExpired             = errors.New("invitation has expired")
	ErrInviteForbidden           = errors.New("invitation does not belong to this account")
	ErrPrivateOrgRequiresPremium = errors.New("private organizations require premium subscription")
)

type OrganizationService interface {
	Create(ctx context.Context, input CreateOrganizationInput, ownerID uuid.UUID) (*model.Organization, error)
	GetByID(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) (*model.Organization, error)
	GetByName(ctx context.Context, name string, requesterID uuid.UUID) (*model.Organization, error)
	ListByOwner(ctx context.Context, ownerID uuid.UUID) ([]*model.Organization, error)
	ListByAccount(ctx context.Context, accountID uuid.UUID) ([]*model.Organization, error)
	ListPublic(ctx context.Context, limit, offset int) ([]*model.Organization, int, error)
	Update(ctx context.Context, id uuid.UUID, input UpdateOrganizationInput, requesterID uuid.UUID) (*model.Organization, error)
	Delete(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) error
	Leave(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) error
	ListMembers(ctx context.Context, organizationID uuid.UUID, requesterID uuid.UUID) ([]*model.OrganizationMember, error)
	InviteMember(ctx context.Context, organizationID uuid.UUID, requesterID uuid.UUID, input InviteOrganizationMemberInput) (*model.OrganizationInvitation, error)
	ListInvitations(ctx context.Context, organizationID uuid.UUID, requesterID uuid.UUID) ([]*model.OrganizationInvitation, error)
	RemoveMember(ctx context.Context, organizationID uuid.UUID, memberAccountID uuid.UUID, requesterID uuid.UUID) error
	RevokeInvitation(ctx context.Context, organizationID uuid.UUID, invitationID uuid.UUID, requesterID uuid.UUID) error
	ListMyInvitations(ctx context.Context, requesterID uuid.UUID) ([]*model.OrganizationInvitation, error)
	AcceptInvitation(ctx context.Context, invitationID uuid.UUID, requesterID uuid.UUID) error
	DeclineInvitation(ctx context.Context, invitationID uuid.UUID, requesterID uuid.UUID) error
}

type CreateOrganizationInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	LogoURL     string `json:"logo_url"`
	Visibility  string `json:"visibility"`
}

type UpdateOrganizationInput struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	LogoURL     *string `json:"logo_url,omitempty"`
	Visibility  *string `json:"visibility,omitempty"`
}

type InviteOrganizationMemberInput struct {
	Email string                       `json:"email"`
	Role  model.OrganizationMemberRole `json:"role"`
}

type organizationService struct {
	orgRepo     repository.OrganizationRepository
	members     repository.OrganizationMemberRepository
	invitations repository.OrganizationInvitationRepository
	accounts    repository.AccountRepository
	users       repository.UserRepository
	emitter     *events.EventEmitter
	env         lib.Env
	billing     billing.BillingService
}

func NewOrganizationService(
	orgRepo repository.OrganizationRepository,
	members repository.OrganizationMemberRepository,
	invitations repository.OrganizationInvitationRepository,
	accounts repository.AccountRepository,
	users repository.UserRepository,
	emitter *events.EventEmitter,
	env lib.Env,
	billing billing.BillingService,
) OrganizationService {
	return &organizationService{
		orgRepo:     orgRepo,
		members:     members,
		invitations: invitations,
		accounts:    accounts,
		users:       users,
		emitter:     emitter,
		env:         env,
		billing:     billing,
	}
}

func (s *organizationService) Create(ctx context.Context, input CreateOrganizationInput, ownerID uuid.UUID) (*model.Organization, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, ErrNameRequired
	}

	existing, _ := s.orgRepo.GetByName(ctx, name)
	if existing != nil {
		return nil, ErrNameTaken
	}

	visibility := s.normalizeVisibility(input.Visibility)
	if visibility == "" {
		return nil, ErrInvalidVisibility
	}
	if visibility == model.OrganizationVisibilityPrivate {
		hasFeature, err := s.billing.HasFeature(ctx, ownerID, billing.FeaturePrivateOrg)
		if err != nil {
			return nil, err
		}
		if !hasFeature {
			return nil, ErrPrivateOrgRequiresPremium
		}
	}

	org := &model.Organization{
		ID:          uuid.New(),
		Name:        name,
		Description: input.Description,
		LogoURL:     normalizeOptionalString(input.LogoURL),
		Visibility:  visibility,
		OwnerID:     ownerID,
	}

	if err := s.orgRepo.Create(ctx, org); err != nil {
		return nil, err
	}

	_ = s.members.Create(ctx, &model.OrganizationMember{
		ID:             uuid.New(),
		OrganizationID: org.ID,
		AccountID:      ownerID,
		Role:           model.OrganizationMemberRoleOwner,
		Status:         model.OrganizationMemberStatusAccepted,
	})

	return org, nil
}

func (s *organizationService) canViewOrg(ctx context.Context, org *model.Organization, requesterID uuid.UUID) bool {
	if org.Visibility == model.OrganizationVisibilityPrivate && !s.env.Features.PrivateOrganizationsEnabled {
		return false
	}
	if org.Visibility == model.OrganizationVisibilityPublic {
		return true
	}
	if requesterID == uuid.Nil {
		return false
	}
	if org.OwnerID == requesterID {
		return true
	}
	member, err := s.members.GetByOrganizationAndAccount(ctx, org.ID, requesterID)
	if err != nil || member == nil {
		return false
	}
	return member.Status == model.OrganizationMemberStatusAccepted
}

func (s *organizationService) canManageOrg(ctx context.Context, org *model.Organization, requesterID uuid.UUID) bool {
	if requesterID == uuid.Nil {
		return false
	}
	if org.OwnerID == requesterID {
		return true
	}
	member, err := s.members.GetByOrganizationAndAccount(ctx, org.ID, requesterID)
	if err != nil || member == nil {
		return false
	}
	if member.Status != model.OrganizationMemberStatusAccepted {
		return false
	}
	return member.Role == model.OrganizationMemberRoleOwner || member.Role == model.OrganizationMemberRoleAdmin
}

func (s *organizationService) GetByID(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) (*model.Organization, error) {
	org, err := s.orgRepo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrNotFound
	}
	if !s.canViewOrg(ctx, org, requesterID) {
		return nil, ErrNotFound
	}
	return org, nil
}

func (s *organizationService) GetByName(ctx context.Context, name string, requesterID uuid.UUID) (*model.Organization, error) {
	org, err := s.orgRepo.GetByName(ctx, name)
	if err != nil {
		return nil, ErrNotFound
	}
	if !s.canViewOrg(ctx, org, requesterID) {
		return nil, ErrNotFound
	}
	return org, nil
}

func (s *organizationService) ListByOwner(ctx context.Context, ownerID uuid.UUID) ([]*model.Organization, error) {
	return s.orgRepo.ListByOwner(ctx, ownerID)
}

func (s *organizationService) ListByAccount(ctx context.Context, accountID uuid.UUID) ([]*model.Organization, error) {
	return s.orgRepo.ListByAccount(ctx, accountID)
}

func (s *organizationService) ListPublic(ctx context.Context, limit, offset int) ([]*model.Organization, int, error) {
	return s.orgRepo.ListPublic(ctx, limit, offset)
}

func (s *organizationService) Update(ctx context.Context, id uuid.UUID, input UpdateOrganizationInput, requesterID uuid.UUID) (*model.Organization, error) {
	org, err := s.orgRepo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrNotFound
	}

	if !s.canManageOrg(ctx, org, requesterID) {
		return nil, ErrNotOwner
	}

	if input.Name != nil && strings.TrimSpace(*input.Name) != "" {
		newName := strings.TrimSpace(*input.Name)
		if newName != org.Name {
			existing, _ := s.orgRepo.GetByName(ctx, newName)
			if existing != nil {
				return nil, ErrNameTaken
			}
		}
		org.Name = newName
	}

	if input.Description != nil {
		org.Description = *input.Description
	}

	if input.LogoURL != nil {
		org.LogoURL = normalizeOptionalString(*input.LogoURL)
	}

	if input.Visibility != nil {
		visibility := s.normalizeVisibility(*input.Visibility)
		if visibility == "" {
			return nil, ErrInvalidVisibility
		}
		if visibility == model.OrganizationVisibilityPrivate {
			hasFeature, featureErr := s.billing.HasFeature(ctx, requesterID, billing.FeaturePrivateOrg)
			if featureErr != nil {
				return nil, featureErr
			}
			if !hasFeature {
				return nil, ErrPrivateOrgRequiresPremium
			}
		}
		org.Visibility = visibility
	}

	if err := s.orgRepo.Update(ctx, org); err != nil {
		return nil, err
	}

	return org, nil
}

func (s *organizationService) Delete(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) error {
	org, err := s.orgRepo.GetByID(ctx, id)
	if err != nil {
		return ErrNotFound
	}

	if org.OwnerID != requesterID {
		return ErrNotOwner
	}

	count, err := s.orgRepo.CountPlates(ctx, id)
	if err != nil {
		return err
	}

	if count > 0 {
		return ErrHasPlates
	}

	return s.orgRepo.Delete(ctx, id)
}

func (s *organizationService) Leave(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) error {
	org, err := s.orgRepo.GetByID(ctx, id)
	if err != nil {
		return ErrNotFound
	}

	if org.OwnerID == requesterID {
		return ErrOwnerCannotLeave
	}

	member, err := s.members.GetByOrganizationAndAccount(ctx, id, requesterID)
	if err != nil {
		return err
	}
	if member == nil || member.Status != model.OrganizationMemberStatusAccepted {
		return ErrNotMember
	}

	if err := s.members.Delete(ctx, id, requesterID); err != nil {
		return err
	}

	if s.emitter != nil {
		if ownerEmail := s.accountEmail(ctx, org.OwnerID); ownerEmail != "" {
			s.emitter.Emit(events.OrganizationMemberLeft, events.OrganizationMemberLeftPayload{
				Email:            ownerEmail,
				OrganizationName: org.Name,
				MemberName:       s.accountLabel(ctx, requesterID),
			})
		}
	}

	return nil
}

func (s *organizationService) ListMembers(ctx context.Context, organizationID uuid.UUID, requesterID uuid.UUID) ([]*model.OrganizationMember, error) {
	org, err := s.orgRepo.GetByID(ctx, organizationID)
	if err != nil {
		return nil, ErrNotFound
	}
	if !s.canManageOrg(ctx, org, requesterID) {
		return nil, ErrNotOwner
	}
	return s.members.ListByOrganization(ctx, organizationID)
}

func (s *organizationService) InviteMember(ctx context.Context, organizationID uuid.UUID, requesterID uuid.UUID, input InviteOrganizationMemberInput) (*model.OrganizationInvitation, error) {
	org, err := s.orgRepo.GetByID(ctx, organizationID)
	if err != nil {
		return nil, ErrNotFound
	}
	if !s.canManageOrg(ctx, org, requesterID) {
		return nil, ErrNotOwner
	}

	email := strings.ToLower(strings.TrimSpace(input.Email))
	if email == "" {
		return nil, ErrInviteEmailInvalid
	}

	role := input.Role
	if role == "" {
		role = model.OrganizationMemberRoleMember
	}
	if role != model.OrganizationMemberRoleAdmin && role != model.OrganizationMemberRoleMember {
		return nil, ErrInvalidInputRole
	}

	inv := &model.OrganizationInvitation{
		ID:             uuid.New(),
		OrganizationID: organizationID,
		InvitedBy:      requesterID,
		Email:          email,
		Role:           role,
		Status:         model.OrganizationInvitationStatusPending,
		ExpiresAt:      time.Now().Add(7 * 24 * time.Hour),
	}

	if err := s.invitations.Create(ctx, inv); err != nil {
		return nil, err
	}

	if s.emitter != nil {
		invitedBy := s.accountLabel(ctx, requesterID)
		s.emitter.Emit(events.OrganizationInvitationSent, events.OrganizationInvitationSentPayload{
			Email:            inv.Email,
			OrganizationName: org.Name,
			InvitedBy:        invitedBy,
			Role:             string(inv.Role),
		})
	}

	return inv, nil
}

func (s *organizationService) ListInvitations(ctx context.Context, organizationID uuid.UUID, requesterID uuid.UUID) ([]*model.OrganizationInvitation, error) {
	org, err := s.orgRepo.GetByID(ctx, organizationID)
	if err != nil {
		return nil, ErrNotFound
	}
	if !s.canManageOrg(ctx, org, requesterID) {
		return nil, ErrNotOwner
	}
	_ = s.invitations.DeleteExpiredPending(ctx)
	return s.invitations.ListByOrganization(ctx, organizationID)
}

func (s *organizationService) RemoveMember(ctx context.Context, organizationID uuid.UUID, memberAccountID uuid.UUID, requesterID uuid.UUID) error {
	org, err := s.orgRepo.GetByID(ctx, organizationID)
	if err != nil {
		return ErrNotFound
	}
	if !s.canManageOrg(ctx, org, requesterID) {
		return ErrNotOwner
	}
	if memberAccountID == org.OwnerID {
		return ErrOwnerCannotBeRemoved
	}
	member, err := s.members.GetByOrganizationAndAccount(ctx, organizationID, memberAccountID)
	if err != nil {
		return err
	}
	if member == nil {
		return ErrNotMember
	}
	if err := s.members.Delete(ctx, organizationID, memberAccountID); err != nil {
		return err
	}

	if s.emitter != nil {
		if ownerEmail := s.accountEmail(ctx, org.OwnerID); ownerEmail != "" {
			s.emitter.Emit(events.OrganizationMemberRemoved, events.OrganizationMemberRemovedPayload{
				Email:            ownerEmail,
				OrganizationName: org.Name,
				MemberName:       s.accountLabel(ctx, memberAccountID),
				RemovedBy:        s.accountLabel(ctx, requesterID),
			})
		}
	}

	return nil
}

func (s *organizationService) RevokeInvitation(ctx context.Context, organizationID uuid.UUID, invitationID uuid.UUID, requesterID uuid.UUID) error {
	org, err := s.orgRepo.GetByID(ctx, organizationID)
	if err != nil {
		return ErrNotFound
	}
	if !s.canManageOrg(ctx, org, requesterID) {
		return ErrNotOwner
	}
	inv, err := s.invitations.GetByID(ctx, invitationID)
	if err != nil || inv == nil {
		return ErrInviteNotFound
	}
	if inv.OrganizationID != organizationID {
		return ErrInviteNotFound
	}
	return s.invitations.DeleteByID(ctx, invitationID)
}

var ErrInvalidInputRole = errors.New("invalid invitation role")

func (s *organizationService) ListMyInvitations(ctx context.Context, requesterID uuid.UUID) ([]*model.OrganizationInvitation, error) {
	account, err := s.accounts.GetByID(ctx, requesterID)
	if err != nil || account == nil || account.UserID == nil {
		return []*model.OrganizationInvitation{}, nil
	}
	user, err := s.users.GetByID(ctx, *account.UserID)
	if err != nil || user == nil || strings.TrimSpace(user.Email) == "" {
		return []*model.OrganizationInvitation{}, nil
	}
	_ = s.invitations.DeleteExpiredPending(ctx)
	return s.invitations.ListByEmail(ctx, user.Email)
}

func (s *organizationService) AcceptInvitation(ctx context.Context, invitationID uuid.UUID, requesterID uuid.UUID) error {
	inv, err := s.invitations.GetByID(ctx, invitationID)
	if err != nil || inv == nil {
		return ErrInviteNotFound
	}
	if inv.Status != model.OrganizationInvitationStatusPending {
		return ErrInviteNotFound
	}
	if inv.ExpiresAt.Before(time.Now()) {
		return ErrInviteExpired
	}

	account, err := s.accounts.GetByID(ctx, requesterID)
	if err != nil || account == nil || account.UserID == nil {
		return ErrInviteForbidden
	}
	user, err := s.users.GetByID(ctx, *account.UserID)
	if err != nil || user == nil {
		return ErrInviteForbidden
	}
	if !strings.EqualFold(strings.TrimSpace(user.Email), strings.TrimSpace(inv.Email)) {
		return ErrInviteForbidden
	}

	member, err := s.members.GetByOrganizationAndAccount(ctx, inv.OrganizationID, requesterID)
	if err != nil {
		return err
	}
	if member == nil {
		member = &model.OrganizationMember{
			ID:             uuid.New(),
			OrganizationID: inv.OrganizationID,
			AccountID:      requesterID,
			Role:           inv.Role,
			Status:         model.OrganizationMemberStatusAccepted,
		}
		if err := s.members.Create(ctx, member); err != nil {
			return err
		}
	} else {
		member.Role = inv.Role
		member.Status = model.OrganizationMemberStatusAccepted
		if err := s.members.Update(ctx, member); err != nil {
			return err
		}
	}

	inv.Status = model.OrganizationInvitationStatusAccepted
	if err := s.invitations.Update(ctx, inv); err != nil {
		return err
	}

	if s.emitter != nil {
		org, orgErr := s.orgRepo.GetByID(ctx, inv.OrganizationID)
		if orgErr == nil && org != nil {
			if ownerEmail := s.accountEmail(ctx, org.OwnerID); ownerEmail != "" {
				s.emitter.Emit(events.OrganizationInvitationAccepted, events.OrganizationInvitationAcceptedPayload{
					Email:            ownerEmail,
					OrganizationName: org.Name,
					MemberName:       s.accountLabel(ctx, requesterID),
					Role:             string(inv.Role),
				})
			}
		}
	}

	return nil
}

func (s *organizationService) DeclineInvitation(ctx context.Context, invitationID uuid.UUID, requesterID uuid.UUID) error {
	inv, err := s.invitations.GetByID(ctx, invitationID)
	if err != nil || inv == nil {
		return ErrInviteNotFound
	}

	account, err := s.accounts.GetByID(ctx, requesterID)
	if err != nil || account == nil || account.UserID == nil {
		return ErrInviteForbidden
	}
	user, err := s.users.GetByID(ctx, *account.UserID)
	if err != nil || user == nil {
		return ErrInviteForbidden
	}
	if !strings.EqualFold(strings.TrimSpace(user.Email), strings.TrimSpace(inv.Email)) {
		return ErrInviteForbidden
	}

	inv.Status = model.OrganizationInvitationStatusDeclined
	return s.invitations.Update(ctx, inv)
}

func (s *organizationService) accountEmail(ctx context.Context, accountID uuid.UUID) string {
	acct, err := s.accounts.GetByID(ctx, accountID)
	if err != nil || acct == nil || acct.UserID == nil {
		return ""
	}
	user, err := s.users.GetByID(ctx, *acct.UserID)
	if err != nil || user == nil {
		return ""
	}
	return strings.TrimSpace(user.Email)
}

func (s *organizationService) accountLabel(ctx context.Context, accountID uuid.UUID) string {
	acct, err := s.accounts.GetByID(ctx, accountID)
	if err == nil && acct != nil {
		if acct.DisplayName != nil && strings.TrimSpace(*acct.DisplayName) != "" {
			return strings.TrimSpace(*acct.DisplayName)
		}
		if acct.UserID != nil {
			user, userErr := s.users.GetByID(ctx, *acct.UserID)
			if userErr == nil && user != nil && strings.TrimSpace(user.Username) != "" {
				return strings.TrimSpace(user.Username)
			}
		}
	}
	return fmt.Sprintf("account:%s", accountID.String())
}

func normalizeOptionalString(v string) *string {
	trimmed := strings.TrimSpace(v)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func (s *organizationService) normalizeVisibility(v string) string {
	trimmed := strings.ToLower(strings.TrimSpace(v))
	if trimmed == "" {
		return model.OrganizationVisibilityPublic
	}
	if trimmed == model.OrganizationVisibilityPrivate && !s.env.Features.PrivateOrganizationsEnabled {
		return ""
	}
	if trimmed != model.OrganizationVisibilityPublic && trimmed != model.OrganizationVisibilityPrivate {
		return ""
	}
	return trimmed
}
