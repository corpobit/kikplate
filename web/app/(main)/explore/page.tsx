import type { Metadata } from "next"
import { PlateGridClient } from "@/src/presentation/components/plates/PlateGridClient"

interface Props {
  searchParams: Promise<{ search?: string; tag?: string; category?: string; badge?: string; type?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  let title = "Explore plates — kikplate"
  let description = "Browse and discover production-ready boilerplates and starter templates. Filter by category, tags, and more."

  if (params.category) {
    title = `${params.category} plates — kikplate`
    description = `Browse ${params.category} boilerplates and starter templates on kikplate.`
  } else if (params.search) {
    title = `"${params.search}" — kikplate`
    description = `Search results for "${params.search}" on kikplate.`
  } else if (params.tag) {
    title = `#${params.tag} plates — kikplate`
    description = `Browse plates tagged "${params.tag}" on kikplate.`
  }

  return { title, description }
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <header className="mb-7 sm:mb-8">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/80 px-5 py-6 sm:px-7 sm:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--muted))_0%,transparent_55%)]" />
          <div className="relative">
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Explore plates</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Discover production-ready starters and boilerplates. Filter by category, tags, and badges to quickly find the right starting point.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">Instant filters</span>
              <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">Badge-aware search</span>
              <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">Fast pagination</span>
            </div>
          </div>
        </div>
      </header>
      <PlateGridClient
        initialSearch={params.search ?? ""}
        initialTag={params.tag ?? ""}
        initialCategory={params.category ?? ""}
        initialBadge={params.badge ?? ""}
      />
    </div>
  )
}