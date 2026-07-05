import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-12">
      <article className="mx-auto max-w-4xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Terms of Use</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026-07-05</p>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">1. Provider</h2>
          <p>Kikplate cloud service at kikplate.dev is operated by Corpobit OÜ, registry code 17360286, Estonia.</p>
          <p>Contact: admin@corpobit.com</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">2. Service Model</h2>
          <p>Kikplate is open source. The hosted cloud version may offer paid or usage-limited features that differ from the self-hosted open-source edition.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">3. Accounts</h2>
          <p>You are responsible for account activity, credentials, and lawful use of the service. You must provide accurate information and keep it up to date.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
          <p>You may not use the service for unlawful activity, abuse, unauthorized access, security testing without permission, or infringement of third-party rights.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">5. Subscriptions and Billing</h2>
          <p>Paid features are billed via Stripe. Subscription terms, billing cycles, taxes, invoices, and payment methods are handled through Stripe checkout and customer portal.</p>
          <p>By subscribing, you authorize recurring charges until cancellation according to your selected plan.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">6. Refund Policy</h2>
          <p>Unless required by applicable law, subscription charges are non-refundable once a billing period starts. Cancellation prevents future renewals but does not retroactively refund elapsed periods.</p>
          <p>If required by law or in exceptional billing errors, contact admin@corpobit.com and we will review case-by-case.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">7. Availability and Changes</h2>
          <p>We may modify features, plans, limits, or pricing with prior notice where required. We do not guarantee uninterrupted or error-free operation.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">8. Intellectual Property</h2>
          <p>The open-source project is licensed under its repository license. Cloud-specific components, branding, and hosted service operations remain the property of Corpobit OÜ unless otherwise stated.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, the service is provided on an as-is and as-available basis, and we are not liable for indirect, incidental, special, or consequential damages.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">10. Termination</h2>
          <p>We may suspend or terminate accounts for material breach, abuse, legal requirements, or security reasons.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">11. Governing Law</h2>
          <p>These terms are governed by the laws of Estonia, without prejudice to mandatory consumer rights under applicable law.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">12. Related Policies</h2>
          <p>Your use is also subject to our <Link href="/privacy" className="underline">Privacy Policy</Link>. Stripe services are subject to Stripe terms available at <Link className="underline" href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">stripe.com/legal</Link>.</p>
        </section>
      </article>
    </div>
  )
}
