"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type {
  PlateBadgeFilterOption,
  PlateCategoryFilterOption,
  PlateTagFilterOption,
} from "@/src/domain/entities/Plate"
import { formatExplorerCategoryLabel } from "@/src/presentation/utils/exploreLabels"

interface Props {
  search: string
  onSearch: (v: string) => void
  onClearAll: () => void
  activeCategories: string[]
  onCategories: (cats: string[]) => void
  activeTags: string[]
  onTags: (tags: string[]) => void
  activeBadges: string[]
  onBadges: (slugs: string[]) => void
  categories: PlateCategoryFilterOption[]
  tags: PlateTagFilterOption[]
  badges: PlateBadgeFilterOption[]
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  count,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  label: string
  count?: number
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        id={`filter-${label}`}
      />
      <label
        htmlFor={`filter-${label}`}
        className={`flex-1 text-sm cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${checked ? "font-medium" : "text-muted-foreground"}`}
      >
        {label}
      </label>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </div>
  )
}

function BadgesDropdown({
  activeBadges,
  onBadges,
  searchTerm,
  setSearchTerm,
  badges,
}: {
  activeBadges: string[]
  onBadges: (slugs: string[]) => void
  searchTerm: string
  setSearchTerm: (s: string) => void
  badges: PlateBadgeFilterOption[]
}) {
  const filtered = badges.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Search className="h-3 w-3 text-muted-foreground shrink-0" />
        <Input
          type="text"
          placeholder="Search badges..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-0">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-1.5">No badges found</p>
        ) : (
          filtered.map((b) => {
            const selected = activeBadges.includes(b.slug)
            const noPlates = b.count === 0
            return (
              <FilterCheckbox
                key={b.slug}
                checked={selected}
                disabled={noPlates && !selected}
                count={b.count}
                onChange={() => {
                  if (selected) {
                    onBadges(activeBadges.filter((s) => s !== b.slug))
                  } else {
                    onBadges([...activeBadges, b.slug])
                  }
                }}
                label={b.name}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function CategoriesDropdown({
  activeCategories,
  onCategories,
  searchTerm,
  setSearchTerm,
  categories,
}: {
  activeCategories: string[]
  onCategories: (cats: string[]) => void
  searchTerm: string
  setSearchTerm: (s: string) => void
  categories: PlateCategoryFilterOption[]
}) {
  const q = searchTerm.toLowerCase()
  const filtered = categories.filter((row) => {
    const label = formatExplorerCategoryLabel(row.slug)
    return (
      row.slug.toLowerCase().includes(q) ||
      label.toLowerCase().includes(q)
    )
  })

  function toggleCategory(slug: string) {
    if (activeCategories.includes(slug)) {
      onCategories(activeCategories.filter((c) => c !== slug))
    } else {
      onCategories([...activeCategories, slug])
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Search className="h-3 w-3 text-muted-foreground shrink-0" />
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-0">
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-1.5">No categories available.</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-1.5">No categories found</p>
        ) : (
          filtered.map((row) => {
            const selected = activeCategories.includes(row.slug)
            const noPlates = row.count === 0
            return (
              <FilterCheckbox
                key={row.slug}
                checked={selected}
                disabled={noPlates && !selected}
                count={row.count}
                onChange={() => toggleCategory(row.slug)}
                label={formatExplorerCategoryLabel(row.slug)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function TagsDropdown({
  activeTags,
  onTags,
  searchTerm,
  setSearchTerm,
  tags,
}: {
  activeTags: string[]
  onTags: (tags: string[]) => void
  searchTerm: string
  setSearchTerm: (s: string) => void
  tags: PlateTagFilterOption[]
}) {
  const filtered = tags.filter((row) => row.tag.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Search className="h-3 w-3 text-muted-foreground shrink-0" />
        <Input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-0">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-1.5">No tags found</p>
        ) : (
          filtered.map((row) => {
            const selected = activeTags.includes(row.tag)
            const noPlates = row.count === 0
            return (
              <FilterCheckbox
                key={row.tag}
                checked={selected}
                disabled={noPlates && !selected}
                count={row.count}
                onChange={() => {
                  if (selected) {
                    onTags(activeTags.filter((at) => at !== row.tag))
                  } else {
                    onTags([...activeTags, row.tag])
                  }
                }}
                label={row.tag}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export function PlateFilters({
  search,
  onSearch,
  onClearAll,
  activeCategories,
  onCategories,
  activeTags,
  onTags,
  activeBadges,
  onBadges,
  categories,
  tags,
  badges,
}: Props) {
  const [tagSearch, setTagSearch] = useState("")
  const [badgeSearch, setBadgeSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")

  const hasActiveFilters =
    search.trim() !== "" ||
    activeCategories.length > 0 ||
    activeTags.length > 0 ||
    activeBadges.length > 0

  return (
    <div className="divide-y divide-border">
      <div className="pb-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Search</p>
        <div className="flex items-center gap-2 rounded-md border border-border px-3 transition-colors hover:border-border/80 focus-within:border-ring">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <Input
            className="h-9 w-full border-0 bg-transparent px-0 ring-0 focus-visible:ring-0"
            placeholder="Search plates..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <Button type="button" variant="ghost" size="icon-xs" onClick={() => onSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex w-full items-center gap-1 text-left text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear all filters
          </button>
        )}
      </div>

      <div className="py-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badges</p>
        {badges.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1 py-1.5">No badges available.</p>
        ) : (
          <BadgesDropdown
            activeBadges={activeBadges}
            onBadges={onBadges}
            searchTerm={badgeSearch}
            setSearchTerm={setBadgeSearch}
            badges={badges}
          />
        )}
      </div>

      <div className="py-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tags</p>
        <TagsDropdown
          activeTags={activeTags}
          onTags={onTags}
          searchTerm={tagSearch}
          setSearchTerm={setTagSearch}
          tags={tags}
        />
      </div>

      <div className="pt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</p>
        <CategoriesDropdown
          activeCategories={activeCategories}
          onCategories={onCategories}
          searchTerm={categorySearch}
          setSearchTerm={setCategorySearch}
          categories={categories}
        />
      </div>
    </div>
  )
}

