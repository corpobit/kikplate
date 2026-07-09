"use client"

import { GitBranch, Heart, User, Building2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type AccountTab = "profile" | "plates" | "bookmarked" | "organizations"

interface Props {
  active: AccountTab
  onChange: (tab: AccountTab) => void
}

const TABS: { id: AccountTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile",           icon: <User      className="h-3.5 w-3.5" /> },
  { id: "plates",  label: "My Plates",        icon: <GitBranch className="h-3.5 w-3.5" /> },
  { id: "bookmarked",    label: "Bookmarked",  icon: <Heart     className="h-3.5 w-3.5" /> },
  { id: "organizations", label: "Organizations", icon: <Building2 className="h-3.5 w-3.5" /> },
]

export function AccountTabs({ active, onChange }: Props) {
  return (
    <Tabs value={active} onValueChange={onChange}>
      <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
        {TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="gap-1.5 px-3">
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}