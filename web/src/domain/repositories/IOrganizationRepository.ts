import type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationInvitation,
  OrganizationMember,
} from "@/src/domain/entities/Organization"

export interface IOrganizationRepository {
  create(input: CreateOrganizationInput): Promise<Organization>
  listMine(): Promise<Organization[]>
  update(id: string, input: UpdateOrganizationInput): Promise<Organization>
  remove(id: string): Promise<void>
  leave(id: string): Promise<{ message: string }>
  inviteMember(organizationId: string, input: { email: string; role: "admin" | "member" }): Promise<OrganizationInvitation>
  listMembers(organizationId: string): Promise<OrganizationMember[]>
  listInvitations(organizationId: string): Promise<OrganizationInvitation[]>
  removeMember(organizationId: string, accountId: string): Promise<{ message: string }>
  revokeInvitation(organizationId: string, invitationId: string): Promise<{ message: string }>
  listMyInvitations(): Promise<OrganizationInvitation[]>
  acceptInvitation(invitationId: string): Promise<{ message: string }>
  declineInvitation(invitationId: string): Promise<{ message: string }>
}
