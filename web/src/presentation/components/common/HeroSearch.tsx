"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, GitBranch, Loader2, Github, Linkedin, ChevronDown, HelpCircle } from "lucide-react"
import { usePlates } from "@/src/presentation/hooks/usePlates"
import { useConfig } from "@/src/presentation/hooks/useConfig"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SAMPLE_QUERIES = [
  "Golang starter",
  "Clean architecture boilerplate for Nodejs",
  "Java spring-boot starter",
  "Python http server",
  "Next.js",
  "Gin framework",
  "Postgresql docker-compose",
  "Nginx",
]

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showHints, setShowHints] = useState(false)

  const { data, isLoading } = usePlates({ search: query, limit: 6 })
  const { data: appConfig } = useConfig()

  const results = data?.data ?? []
  const showDropdown = open && query.trim().length > 1
  const titleLines = (appConfig?.banner_title ?? "The biggest library of\nstarter boilerplates").split("\n")
  const socialItems = (appConfig?.social_media ?? [])
    .filter((s) => s.link && s.link !== "#")
    .slice(0, 6)
  const sampleQueries = appConfig?.prepared_queries ?? SAMPLE_QUERIES

  const SlackIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  )

  function socialLabel(type: string) {
    const t = type.toLowerCase()
    if (t === "x") return "X"
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  function socialIcon(type: string) {
    const t = type.toLowerCase()
    if (t === "github") return <Github className="h-4 w-4" />
    if (t === "linkedin") return <Linkedin className="h-4 w-4" />
    if (t === "slack") return <SlackIcon />
    if (t === "x") return <span className="text-xs font-bold">X</span>
    return null
  }

  function handleSearch(value: string) {
    if (!value.trim()) return
    setOpen(false)
    router.push(`/explore?search=${encodeURIComponent(value.trim())}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch(query)
    if (e.key === "Escape") setOpen(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setShowHints(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

      <div className="flex flex-col items-center gap-6 w-full max-w-6xl">

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground w-full leading-[1.1]">
          {titleLines.map((line, idx) => (
            <span key={`${line}-${idx}`}>
              {line}
              {idx < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Discover, share and generate production-ready projects from reusable templates. Built by the community, for the community.
        </p>

        <div className="w-full max-w-4xl mt-2" ref={containerRef}>
          <div className="relative">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 transition-all hover:border-border/80 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                className="h-14 w-full border-0 bg-transparent px-0 text-base ring-0 focus-visible:ring-0"
                placeholder="Search plates... e.g. golang clean architecture"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                  setShowHints(false)
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setOpen(true)}
              />
              {isLoading && query.trim().length > 1 && (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowHints(!showHints)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Search tips"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>

            {showHints && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-md border bg-popover p-4 text-popover-foreground">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Search tips</p>
                  <Button variant="ghost" size="xs" onClick={() => setShowHints(false)}>Close</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">By name or keyword</p>
                      <p className="text-xs text-muted-foreground mt-0.5"><code className="bg-muted px-1 py-0.5">golang starter</code></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">By framework</p>
                      <p className="text-xs text-muted-foreground mt-0.5"><code className="bg-muted px-1 py-0.5">spring-boot</code> <code className="bg-muted px-1 py-0.5">nestjs</code></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">By language</p>
                      <p className="text-xs text-muted-foreground mt-0.5"><code className="bg-muted px-1 py-0.5">python</code> <code className="bg-muted px-1 py-0.5">java</code> <code className="bg-muted px-1 py-0.5">go</code></p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">Exclude words</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Use <code className="bg-muted px-1 py-0.5">-</code> prefix: <code className="bg-muted px-1 py-0.5">nodejs -express</code></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">By description</p>
                      <p className="text-xs text-muted-foreground mt-0.5"><code className="bg-muted px-1 py-0.5">clean architecture</code> <code className="bg-muted px-1 py-0.5">docker-compose</code></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Combine terms</p>
                      <p className="text-xs text-muted-foreground mt-0.5"><code className="bg-muted px-1 py-0.5">react typescript starter</code></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-md border bg-popover text-popover-foreground">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No plates found for &quot;{query}&quot;</p>
                    <Button
                      onClick={() => handleSearch(query)}
                      variant="link"
                      size="xs"
                      className="mt-2"
                    >
                      Search all plates →
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="py-1">
                      {results.map((plate) => (
                        <Link
                          key={plate.id}
                          href={`/plates/${plate.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <div className="mt-0.5 text-muted-foreground shrink-0">
                            <GitBranch className="h-4 w-4" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{plate.name}</p>
                            {plate.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{plate.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground/60 mt-0.5 capitalize">{plate.category}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border px-4 py-2.5">
                      <Button
                        onClick={() => handleSearch(query)}
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        See all results for &quot;{query}&quot; →
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You can also{" "}
          <Link href="/explore" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            browse all plates
          </Link>
          {" "}or try one of the sample queries:
        </p>

        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {sampleQueries.map((q) => (
            <Button
              key={q}
              onClick={() => handleSearch(q)}
              variant="outline"
              size="xs"
              className="text-muted-foreground hover:text-foreground"
            >
              {q}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <p className="text-xs text-muted-foreground">KikPlate is an Open Source project</p>
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-2">
            {socialItems.map((item, idx) => (
              <Button
                key={`footer-${item.type}-${idx}`}
                asChild
                variant="outline"
                size="icon-xs"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
                title={socialLabel(item.type)}
              >
                <Link href={item.link} target="_blank" rel="noopener noreferrer">
                  {socialIcon(item.type)}
                </Link>
              </Button>
            ))}
          </div>
        </div>

      </div>

      <div className="absolute bottom-6 flex flex-col items-center gap-1.5 text-muted-foreground/30 animate-bounce">
        <ChevronDown className="h-4 w-4" />
      </div>

    </div>
  )
}