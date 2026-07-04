package plate

import (
	"context"

	"github.com/google/uuid"
	"github.com/kickplate/api/model"
)

func (s *plateService) canManageOrganization(ctx context.Context, organizationID, accountID uuid.UUID) (bool, error) {
	org, err := s.orgs.GetByID(ctx, organizationID)
	if err != nil || org == nil {
		return false, err
	}
	if org.OwnerID == accountID {
		return true, nil
	}
	if s.orgMembers == nil {
		return false, nil
	}
	member, err := s.orgMembers.GetByOrganizationAndAccount(ctx, organizationID, accountID)
	if err != nil || member == nil {
		return false, err
	}
	if member.Status != model.OrganizationMemberStatusAccepted {
		return false, nil
	}
	return member.Role == model.OrganizationMemberRoleOwner || member.Role == model.OrganizationMemberRoleAdmin, nil
}

func (s *plateService) hasOrganizationAccess(ctx context.Context, organizationID, accountID uuid.UUID) (bool, error) {
	org, err := s.orgs.GetByID(ctx, organizationID)
	if err != nil || org == nil {
		return false, err
	}
	if org.OwnerID == accountID {
		return true, nil
	}
	if s.orgMembers == nil {
		return false, nil
	}
	member, err := s.orgMembers.GetByOrganizationAndAccount(ctx, organizationID, accountID)
	if err != nil || member == nil {
		return false, err
	}
	return member.Status == model.OrganizationMemberStatusAccepted, nil
}
