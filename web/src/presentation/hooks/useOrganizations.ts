"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { organizationRepository } from "@/src/data/repositories/OrganizationRepository"
import {
  GetMyOrganizationsUseCase,
  CreateOrganizationUseCase,
  UpdateOrganizationUseCase,
  RemoveOrganizationUseCase,
} from "@/src/domain/usecases/OrganizationUseCases"
import type { CreateOrganizationInput, UpdateOrganizationInput } from "@/src/domain/entities/Organization"

const getMyOrganizations = new GetMyOrganizationsUseCase(organizationRepository)
const createOrganization = new CreateOrganizationUseCase(organizationRepository)
const updateOrganization = new UpdateOrganizationUseCase(organizationRepository)
const removeOrganization = new RemoveOrganizationUseCase(organizationRepository)

export function useMyOrganizations() {
  return useQuery({
    queryKey: ["organizations", "me"],
    queryFn: () => getMyOrganizations.execute(),
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
