"use client"

import { useState } from "react"
import { getBadgeIcon } from "@/src/presentation/utils/badgeIcons"
import type { PlateBadge } from "@/src/domain/entities/Plate"

interface Props {
  badges: PlateBadge[]
}

export function HeaderBadges({ badges }: Props) {
  const granted = badges.filter((pb) => pb.badge)
  if (granted.length === 0) return null

  return (
    <>
      {granted.map((pb) => (
        <BadgeIcon key={pb.id} plateBadge={pb} />
      ))}
    </>
  )
}

function BadgeIcon({ plateBadge }: { plateBadge: PlateBadge }) {
  const [open, setOpen] = useState(false)
  const badge = plateBadge.badge!
  const Icon = getBadgeIcon(badge.slug)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="inline-flex items-center justify-center border border-foreground/20 bg-foreground/5 p-1.5 text-foreground cursor-default">
        <Icon className="h-3.5 w-3.5" />
      </span>

      {open && (
        <span className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 border border-border bg-card p-3 shadow-lg">
          <span className="block text-sm font-semibold text-foreground">{badge.name}</span>
          {badge.description && (
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {badge.description}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
