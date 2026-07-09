"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, GitBranch, Loader2, X } from "lucide-react"
import { usePlates } from "@/src/presentation/hooks/usePlates"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NavbarSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = usePlates({ search: query, limit: 5 })

  const results = data?.data ?? []
  const showDropdown = open && query.trim().length > 1

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
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="w-80 max-w-sm" ref={containerRef}>
      <div className="relative">
        <div className="flex items-center border border-border/50 bg-muted/30 px-3 gap-2 rounded-md focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 transition-all h-9">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            className="h-full w-full border-0 bg-transparent px-0 text-xs ring-0 focus-visible:ring-0"
            placeholder="Search plates..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setQuery("")
                setOpen(false)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isLoading && query.trim().length > 1 && (
            <Loader2 className="h-3 w-3 text-muted-foreground animate-spin shrink-0" />
          )}
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-card">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-3 text-center">
                <p className="text-xs text-muted-foreground">No plates found for &quot;{query}&quot;</p>
                <Button
                  type="button"
                  onClick={() => handleSearch(query)}
                  variant="link"
                  size="xs"
                  className="mt-1.5"
                >
                  Search all plates →
                </Button>
              </div>
            ) : (
              <>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {results.map((plate) => (
                    <Link
                      key={plate.id}
                      href={`/plates/${plate.slug}`}
                      onClick={() => {
                        setOpen(false)
                        setQuery("")
                      }}
                      className="flex items-start gap-2 px-3 py-2 transition-colors hover:bg-muted hover:border-l-2 hover:border-primary/40"
                    >
                      <div className="mt-0.5 text-muted-foreground shrink-0">
                        <GitBranch className="h-3 w-3" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{plate.name}</p>
                        {plate.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{plate.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border px-3 py-2">
                  <Button
                    type="button"
                    onClick={() => handleSearch(query)}
                    variant="ghost"
                    size="xs"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    See all results →
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
