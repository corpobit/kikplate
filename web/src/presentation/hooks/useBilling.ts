"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { billingRepository } from "@/src/data/repositories/BillingRepository"

export function useAccountBilling(enabled = true) {
  return useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => billingRepository.me(),
    enabled,
    staleTime: 15_000,
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: () => billingRepository.createCheckoutSession(),
  })
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () => billingRepository.createPortalSession(),
  })
}
