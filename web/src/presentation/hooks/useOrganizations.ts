"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { organizationRepository } from "@/src/data/repositories/OrganizationRepository"
import {
  GetMyOrganizationsUseCase,
  CreateOrganizationUseCase,
  UpdateOrganizationUseCase,
  RemoveOrganizationUseCase,
  LeaveOrganizationUseCase,
  InviteOrganizationMemberUseCase,
  ListOrganizationMembersUseCase,
  ListOrganizationInvitationsUseCase,
  RemoveOrganizationMemberUseCase,
  RevokeOrganizationInvitationUseCase,
  ListMyOrganizationInvitationsUseCase,
  AcceptOrganizationInvitationUseCase,
  DeclineOrganizationInvitationUseCase,
} from "@/src/domain/usecases/OrganizationUseCases"
import type { CreateOrganizationInput, UpdateOrganizationInput } from "@/src/domain/entities/Organization"

const getMyOrganizations = new GetMyOrganizationsUseCase(organizationRepository)
const createOrganization = new CreateOrganizationUseCase(organizationRepository)
const updateOrganization = new UpdateOrganizationUseCase(organizationRepository)
const removeOrganization = new RemoveOrganizationUseCase(organizationRepository)
const leaveOrganization = new LeaveOrganizationUseCase(organizationRepository)
const inviteOrganizationMember = new InviteOrganizationMemberUseCase(organizationRepository)
const listOrganizationMembers = new ListOrganizationMembersUseCase(organizationRepository)
const listOrganizationInvitations = new ListOrganizationInvitationsUseCase(organizationRepository)
const removeOrganizationMember = new RemoveOrganizationMemberUseCase(organizationRepository)
const revokeOrganizationInvitation = new RevokeOrganizationInvitationUseCase(organizationRepository)
const listMyOrganizationInvitations = new ListMyOrganizationInvitationsUseCase(organizationRepository)
const acceptOrganizationInvitation = new AcceptOrganizationInvitationUseCase(organizationRepository)
const declineOrganizationInvitation = new DeclineOrganizationInvitationUseCase(organizationRepository)

export function useMyOrganizations() {
  return useQuery({
    queryKey: ["organizations", "me"],
    queryFn: () => getMyOrganizations.execute(),
    staleTime: 30_000,
  })
}

export function useMyOrganizationInvitations() {
  return useQuery({
    queryKey: ["organizations", "invitations", "me"],
    queryFn: () => listMyOrganizationInvitations.execute(),
    staleTime: 30_000,
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization.execute(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      qc.invalidateQueries({ queryKey: ["organizations", "me"] })
    },
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      updateOrganization.execute(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      qc.invalidateQueries({ queryKey: ["organizations", "me"] })
    },
  })
}

export function useRemoveOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeOrganization.execute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      qc.invalidateQueries({ queryKey: ["organizations", "me"] })
    },
  })
}

export function useLeaveOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leaveOrganization.execute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      qc.invalidateQueries({ queryKey: ["organizations", "me"] })
      qc.invalidateQueries({ queryKey: ["plates"] })
    },
  })
}

export function useInviteOrganizationMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, input }: { organizationId: string; input: { email: string; role: "admin" | "member" } }) =>
      inviteOrganizationMember.execute(organizationId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      qc.invalidateQueries({ queryKey: ["organizations", "invitations", "me"] })
    },
  })
}

export function useOrganizationMembers(organizationId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["organizations", organizationId, "members"],
    queryFn: () => listOrganizationMembers.execute(organizationId),
    enabled,
    staleTime: 30_000,
  })
}

export function useOrganizationInvitations(organizationId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["organizations", organizationId, "invitations"],
    queryFn: () => listOrganizationInvitations.execute(organizationId),
    enabled,
    staleTime: 30_000,
  })
}

export function useRemoveOrganizationMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, accountId }: { organizationId: string; accountId: string }) =>
      removeOrganizationMember.execute(organizationId, accountId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["organizations", vars.organizationId, "members"] })
      qc.invalidateQueries({ queryKey: ["organizations", vars.organizationId, "invitations"] })
      qc.invalidateQueries({ queryKey: ["organizations", "me"] })
      qc.invalidateQueries({ queryKey: ["plates"] })
    },
  })
}

export function useRevokeOrganizationInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, invitationId }: { organizationId: string; invitationId: string }) =>
      revokeOrganizationInvitation.execute(organizationId, invitationId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["organizations", vars.organizationId, "invitations"] })
      qc.invalidateQueries({ queryKey: ["organizations", vars.organizationId, "members"] })
    },
  })
}

export function useAcceptOrganizationInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) => acceptOrganizationInvitation.execute(invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations", "me"] })
      qc.invalidateQueries({ queryKey: ["organizations", "invitations", "me"] })
      qc.invalidateQueries({ queryKey: ["plates"] })
    },
  })
}

export function useDeclineOrganizationInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) => declineOrganizationInvitation.execute(invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations", "invitations", "me"] })
    },
  })
}
