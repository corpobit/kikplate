import { RegisterForm } from "@/src/presentation/components/auth/RegisterForm"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_92%_4%,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_50%_100%,hsl(var(--muted-foreground)/0.10),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-24 top-28 h-64 w-64 rounded-full border border-border/50 bg-muted/30 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-56 w-56 rounded-full border border-border/50 bg-card/40 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-md rounded-2xl border border-foreground/20 dark:border-border/80 bg-card/92 p-6 shadow-[0_18px_65px_hsl(var(--foreground)/0.08)] backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-md transition-colors hover:text-primary">
              <Image
                src="/kikplate-logo-on-dark.svg"
                alt="KikPlate"
                width={28}
                height={28}
                className="rounded-md"
                priority
              />
              <span className="text-base font-semibold tracking-tight text-foreground">KikPlate</span>
            </Link>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              create account
            </span>
          </div>

          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Start publishing and managing templates in minutes.</p>
          </div>

          <RegisterForm />
        </section>
      </div>
    </main>
  )
}
