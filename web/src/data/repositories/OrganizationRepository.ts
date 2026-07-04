import { http } from "./httpClient"
import type { IOrganizationRepository } from "@/src/domain/repositories/IOrganizationRepository"
import type {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationInvitation,
  OrganizationMember,
} from "@/src/domain/entities/Organization"

class OrganizationRepository implements IOrganizationRepository {
  create(input: CreateOrganizationInput): Promise<Organization> {
    return http.post("/organizations", input)
  }

  listMine(): Promise<Organization[]> {
    return http.get("/organizations/me")
  }

  update(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    return http.put(`/organizations/${id}`, input)
  }

  remove(id: string): Promise<void> {
    return http.delete(`/organizations/${id}`)
  }

  leave(id: string): Promise<{ message: string }> {
    return http.post(`/organizations/${id}/leave`, {})
  }

  inviteMember(organizationId: string, input: { email: string; role: "admin" | "member" }): Promise<OrganizationInvitation> {
    return http.post(`/organizations/${organizationId}/invitations`, input)
  }

  listMembers(organizationId: string): Promise<OrganizationMember[]> {
    return http.get(`/organizations/${organizationId}/members`)
  }

  listInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
    return http.get(`/organizations/${organizationId}/invitations`)
  }

  removeMember(organizationId: string, accountId: string): Promise<{ message: string }> {
    return http.delete(`/organizations/${organizationId}/members/${accountId}`)
  }

  revokeInvitation(organizationId: string, invitationId: string): Promise<{ message: string }> {
    return http.delete(`/organizations/${organizationId}/invitations/${invitationId}`)
  }

  listMyInvitations(): Promise<OrganizationInvitation[]> {
    return http.get("/organizations/invitations/me")
  }

  acceptInvitation(invitationId: string): Promise<{ message: string }> {
    return http.post(`/organizations/invitations/${invitationId}/accept`, {})
  }

  declineInvitation(invitationId: string): Promise<{ message: string }> {
    return http.post(`/organizations/invitations/${invitationId}/decline`, {})
  }
}

export const organizationRepository = new OrganizationRepository()
