import { http } from "./httpClient"
import type { AccountBilling, CheckoutSessionResponse, PortalSessionResponse, PremiumPricing } from "@/src/domain/entities/Billing"

class BillingRepository {
  pricing(): Promise<PremiumPricing> {
    return http.get("/billing/pricing")
  }

  me(): Promise<AccountBilling> {
    return http.get("/billing/me")
  }

  createCheckoutSession(): Promise<CheckoutSessionResponse> {
    return http.post("/billing/checkout/session", {})
  }

  createPortalSession(): Promise<PortalSessionResponse> {
    return http.post("/billing/portal/session", {})
  }
}

export const billingRepository = new BillingRepository()
