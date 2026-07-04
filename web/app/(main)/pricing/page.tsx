"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Loader2, Sparkles, ShieldCheck, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMe } from "@/src/presentation/hooks/useAuth"
import { useAccountBilling, useCreateCheckoutSession, useCreatePortalSession } from "@/src/presentation/hooks/useBilling"

export default function PricingPage() {
  const { data: me, isLoading: meLoading } = useMe()
  const isSignedIn = !!me
  const billing = useAccountBilling(isSignedIn)
  const checkout = useCreateCheckoutSession()
  const portal = useCreatePortalSession()

  const premiumActive = useMemo(() => {
    if (!billing.data) return false
    return billing.data.has_premium
  }, [billing.data])

  const checkoutError = checkout.error instanceof Error ? checkout.error.message : null
  const portalError = portal.error instanceof Error ? portal.error.message : null

  async function onCheckout() {
    const result = await checkout.mutateAsync()
    window.location.href = result.checkout_url
  }

  async function onPortal() {
    const result = await portal.mutateAsync()
    window.location.href = result.portal_url
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <section className="border border-border bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pricing</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Simple plans for teams building with templates</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Free gives you full public collaboration. Premium unlocks private organizations so your internal templates stay private.
          </p>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Free</p>
                <h2 className="mt-1 font-heading text-2xl font-bold">$0</h2>
                <p className="text-sm text-muted-foreground">For public usage</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <ul className="mt-5 space-y-2 text-sm text-foreground">
              <li>Public organizations</li>
              <li>Public plate management</li>
              <li>Community collaboration</li>
            </ul>
            <div className="mt-6">
              <Button variant="outline" className="w-full" disabled>
                Current baseline
              </Button>
            </div>
          </article>

          <article className="border border-primary/30 bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Premium</p>
                <h2 className="mt-1 font-heading text-2xl font-bold">Subscription</h2>
                <p className="text-sm text-muted-foreground">For private teams</p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <ul className="mt-5 space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Private organizations</li>
              <li>Same public features included</li>
              <li>Manage billing in Stripe portal</li>
            </ul>

            <div className="mt-6 space-y-2">
              {!isSignedIn && !meLoading && (
                <Link href="/login" className="inline-flex w-full items-center justify-center bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Sign in to subscribe
                </Link>
              )}

              {isSignedIn && !premiumActive && (
                <Button onClick={onCheckout} className="w-full" disabled={checkout.isPending}>
                  {checkout.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start premium checkout
                </Button>
              )}

              {isSignedIn && premiumActive && (
                <Button onClick={onPortal} variant="outline" className="w-full" disabled={portal.isPending}>
                  {portal.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Manage subscription
                </Button>
              )}

              {checkoutError && <p className="text-xs text-destructive">{checkoutError}</p>}
              {portalError && <p className="text-xs text-destructive">{portalError}</p>}
            </div>
          </article>
        </section>

        {isSignedIn && billing.data && (
          <section className="mt-6 border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your billing status</p>
            <p className="mt-2 text-sm text-foreground">Plan: {billing.data.plan_code}</p>
            <p className="text-sm text-foreground">Status: {billing.data.status}</p>
            {billing.data.current_period_end && (
              <p className="text-sm text-foreground">Current period ends: {new Date(billing.data.current_period_end).toLocaleDateString()}</p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
