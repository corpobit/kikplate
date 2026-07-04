import Link from "next/link"

export default function BillingSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Subscription activated</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Stripe completed your checkout. Your premium access will be enabled as soon as webhook processing finishes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/account?tab=organizations" className="inline-flex items-center justify-center border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/40">
            Go to organizations
          </Link>
          <Link href="/pricing" className="inline-flex items-center justify-center bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Back to pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
