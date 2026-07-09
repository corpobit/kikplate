"use client"

import Link from "next/link"
import { useConfig } from "@/src/presentation/hooks/useConfig"
import { getSocialLink } from "@/src/lib/socialLinks"

const COMMUNITY = [
  { label: "GitHub", type: "github" as const },
  { label: "Slack", type: "slack" as const },
  { label: "X", type: "x" as const },
  { label: "LinkedIn", type: "linkedin" as const },
]

export function Footer() {
  const { data: appConfig } = useConfig()

  const communityLinks = COMMUNITY.map(({ label, type }) => ({
    label,
    href: getSocialLink(appConfig?.social_media, type),
  })).filter((l): l is { label: string; href: string } => Boolean(l.href))

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-base font-semibold text-foreground">
              Kik<span className="font-bold">Plate</span>
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Open source registry for reusable project templates, maintained by the community.
            </p>
            <Link
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Apache 2.0 License
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Product</p>
            <ul className="space-y-2">
              {[
                { label: "Explore", href: "/explore" },
                { label: "Stats", href: "/stats" },
                { label: "Submit", href: "/submit" },
                { label: "Account", href: "/account" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Community</p>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Resources</p>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs?doc=cli" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  CLI
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/kikplate/kikplate/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/kikplate/kikplate/blob/main/docs/contributing.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contributing
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KikPlate. Open source and free forever.
          </p>
        </div>
      </div>
    </footer>
  )
}
