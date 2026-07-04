export interface AccountBilling {
  plan_code: string
  status: string
  has_premium: boolean
  features: string[]
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_end?: string
}

export interface CheckoutSessionResponse {
  checkout_url: string
}

export interface PortalSessionResponse {
  portal_url: string
}

export interface PremiumPricing {
  price_id: string
  currency: string
  amount: number
  interval: string
  interval_count: number
}
