import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-12">
      <article className="mx-auto max-w-4xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026-07-05</p>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">1. Data Controller</h2>
          <p>Corpobit OÜ (registry code 17360286) is the data controller for Kikplate cloud services provided at kikplate.dev.</p>
          <p>Registered address: Harju maakond, Tallinn, Kesklinna linnaosa, Uus-Sadama tn 21-207, 10120, Estonia.</p>
          <p>Contact email: admin@corpobit.com</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">2. Scope</h2>
          <p>This policy applies to the hosted cloud version of Kikplate at kikplate.dev. The open-source self-hosted edition is operated independently by each deployer.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">3. Personal Data We Process</h2>
          <p>We may process account identifiers, name, username, profile image URL, email address, authentication provider information, organization and collaboration metadata, and billing-related metadata required to manage subscription status.</p>
          <p>Payment card details are not stored by us. Payments are processed by Stripe.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">4. Purposes and Legal Bases</h2>
          <p>We process personal data to provide the service, secure accounts, enable collaboration features, process subscription access, comply with legal obligations, and improve reliability and support.</p>
          <p>Legal bases under GDPR include contract performance, legal obligations, legitimate interests, and consent where applicable.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">5. Stripe Payments</h2>
          <p>Stripe is our payment processor. When you subscribe, billing-related data is shared with Stripe to create and manage subscriptions, invoices, and payment events.</p>
          <p>Stripe may act as an independent controller or processor depending on processing activity. Please review Stripe privacy terms at <Link className="underline" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</Link>.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">6. Data Sharing</h2>
          <p>We share data only with service providers needed to deliver the service, including hosting, authentication integrations, email delivery, and Stripe for payment processing.</p>
          <p>We do not sell personal data.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">7. International Transfers</h2>
          <p>Where data is transferred outside the EEA, we rely on GDPR-compliant transfer mechanisms such as adequacy decisions or standard contractual clauses provided by processors.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">8. Retention</h2>
          <p>We retain account and service data only as long as needed for service delivery, legal compliance, and dispute handling. Data may be retained for a limited period in backups and security logs.</p>
          <p>When an account is deleted, we remove or anonymize data where technically and legally feasible.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">9. Your GDPR Rights</h2>
          <p>You may request access, correction, deletion, restriction, objection, and portability of your personal data. You may also lodge a complaint with your local supervisory authority.</p>
          <p>To exercise rights, contact admin@corpobit.com.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">10. Security</h2>
          <p>We use reasonable technical and organizational controls to protect personal data, including access control, transport security, and operational monitoring.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">11. Cookies and Similar Technologies</h2>
          <p>We use essential session and authentication cookies required for core service operation. If optional analytics or marketing cookies are introduced, this policy will be updated and consent requirements will be applied where required.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm leading-7 text-foreground">
          <h2 className="text-lg font-semibold">12. Changes to This Policy</h2>
          <p>We may update this policy from time to time. The latest version is always published on this page with an updated date.</p>
        </section>
      </article>
    </div>
  )
}
