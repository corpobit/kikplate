"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { useMe, useLogout } from "@/src/presentation/hooks/useAuth"
import { usePlates } from "@/src/presentation/hooks/usePlates"
import { useMounted } from "@/src/presentation/hooks/useMounted"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/src/presentation/components/common/LoadingSpinner"
import { AccountTabs, type AccountTab } from "@/src/presentation/components/account/AccountTabs"
import { ProfileDetails } from "@/src/presentation/components/account/ProfileDetails"
import { OwnedPlates } from "@/src/presentation/components/account/OwnedPlates"
import { BookmarkedPlates } from "@/src/presentation/components/account/BookmarkedPlates"
import { OrganizationsManager } from "@/src/presentation/components/account/OrganizationsManager"

function AccountContent() {
  const mounted = useMounted()
  const { data: me, isLoading } = useMe()
  const logout = useLogout()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const resolveTab = (value: string | null): AccountTab => {
    if (value === "plates" || value === "bookmarked" || value === "organizations" || value === "profile") {
      return value
    }
    return "profile"
  }

  const [tab, setTab] = useState<AccountTab>(() => resolveTab(searchParams.get("tab")))

  const { data: ownedData } = usePlates(
    me ? { owner_id: me.account_id, limit: 1000 } : {}
  )

  const totalStars = ownedData?.data?.reduce((sum, plate) => {
    return sum + (plate.avg_rating ? Math.round(plate.avg_rating * 10) / 10 : 0)
  }, 0) ?? 0

  function handleLogout() {
    setLogoutDialogOpen(false)
    logout()
    router.push("/")
    router.refresh()
  }

  function handleTabChange(nextTab: AccountTab) {
    setTab(nextTab)
    if (nextTab === "profile") {
      router.replace("/account")
      return
    }
    router.replace(`/account?tab=${nextTab}`)
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            You need to sign in to view your account.
          </p>
          <Link href="/login" className="text-sm font-medium underline underline-offset-4">
            Sign in →
          </Link>
        </div>
      </div>
    )
  }

  const displayName = me.username ?? me.display_name ?? "User"
  const initials = displayName.slice(0, 2).toUpperCase()

  const stats = [
    { label: "Plates", value: ownedData?.total ?? "—" },
    { label: "Stars",  value: totalStars > 0 ? totalStars.toFixed(1) : "—" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/10">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Account Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center border border-border bg-card rounded-lg text-xl font-bold text-foreground overflow-hidden">
                {me.avatar_url ? (
                  <Image
                    src={me.avatar_url}
                    alt={displayName}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold text-foreground">{displayName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {me.email && <span>{me.email}</span>}
                  {me.email && <span>·</span>}
                  <span className="capitalize">{me.provider}</span>
                  {me.role && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{me.role}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogoutDialogOpen(true)}
              className="gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>

          {/* Account Stats */}
          <div className="grid w-full grid-cols-2 border border-border bg-card rounded-lg sm:flex sm:w-fit">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center gap-0.5 px-6 py-3 ${
                  i < stats.length - 1 ? "border-r border-border" : ""
                }`}
              >
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs inside header */}
          <AccountTabs active={tab} onChange={handleTabChange} />
        </div>
      </div>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be signed out of your account on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-10">
        {tab === "profile" && <ProfileDetails me={me} />}
        {tab === "plates"  && <OwnedPlates accountId={me.account_id} />}
        {tab === "bookmarked"    && <BookmarkedPlates />}
        {tab === "organizations" && <OrganizationsManager />}
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AccountContent />
    </Suspense>
  )
}