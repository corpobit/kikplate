"use client"

import { ExternalLink } from "lucide-react"
import { getBadgeIcon } from "@/src/presentation/utils/badgeIcons"
import { useMe } from "@/src/presentation/hooks/useAuth"
import { useMounted } from "@/src/presentation/hooks/useMounted"
import type { Badge } from "@/src/domain/entities/Badge"
import type { PlateBadge } from "@/src/domain/entities/Plate"

interface Props {
  allBadges: Badge[]
  plateBadges: PlateBadge[]
  plateOwnerId: string
  plateSlug: string
  requestUrl?: string
}

export function BadgeShowcase({ allBadges, plateBadges, plateOwnerId, plateSlug, requestUrl }: Props) {
  const mounted = useMounted()
  const { data: me } = useMe()
  const isOwner = mounted && me?.account_id === plateOwnerId

  const grantedSlugs = new Set(
    plateBadges
      .map((pb) => pb.badge?.slug)
      .filter(Boolean),
  )

  if (allBadges.length === 0) return null

  return (
    <div className="border border-border bg-card p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Badges
      </p>
      <div className="flex flex-wrap gap-2">
        {allBadges.map((badge) => {
          const active = grantedSlugs.has(badge.slug)
          const Icon = getBadgeIcon(badge.slug)
          return (
            <span
              key={badge.id}
              title={badge.description || badge.name}
              className={`inline-flex items-center gap-1 border px-2 py-0.5 text-xs font-semibold ${
                active
                  ? "border-foreground/20 bg-foreground/5 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground/30"
              }`}
            >
              <Icon className="h-2.5 w-2.5" />
              {badge.name}
            </span>
          )
        })}
      </div>

      {isOwner && requestUrl && (
        <a
          href={`${requestUrl}${requestUrl.includes("?") ? "&" : "?"}plate=${encodeURIComponent(plateSlug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-1.5 text-xs font-medium text-foreground underline underline-offset-2 hover:text-muted-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          Claim a badge
        </a>
      )}
    </div>
  )
}
