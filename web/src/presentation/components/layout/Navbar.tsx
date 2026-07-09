"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useMe, useLogout } from "@/src/presentation/hooks/useAuth"
import { useConfig } from "@/src/presentation/hooks/useConfig"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavbarSearch } from "./NavbarSearch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut, User, UserPlus, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export function Navbar() {
  const { data: me } = useMe()
  const { data: appConfig } = useConfig()
  const logout = useLogout()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && me && !me.username && !window.location.pathname.startsWith("/set-username")) {
      router.push("/set-username")
    }
  }, [mounted, me, router])

  const initials = me?.username
    ? me.username.slice(0, 2).toUpperCase()
    : me?.display_name
    ? me.display_name.slice(0, 2).toUpperCase()
    : "?"

  function handleLogout() {
    logout()
    router.push("/")
    router.refresh()
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <button
          type="button"
          className="flex shrink-0 items-center gap-3 text-left"
          onClick={() => router.push("/")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={appConfig?.logo ?? "/kikplate-logo-on-dark.svg"}
            alt="logo"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="hidden text-lg font-semibold tracking-tight text-foreground sm:inline">
            Kik<span className="font-bold">Plate</span>
          </span>
        </button>

        <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/explore" className="transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/stats" className="transition-colors hover:text-foreground" title="Stats">
            Stats
          </Link>
          {me && (
            <Link href="/submit" className="transition-colors hover:text-foreground">
              Submit
            </Link>
          )}
          {pathname !== "/" && !pathname?.startsWith("/explore") && (
            <NavbarSearch />
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {me ? (
            <>
              <Avatar key={me.account_id} className="h-8 w-8 rounded-md border border-border">
                {me.avatar_url && <AvatarImage src={me.avatar_url} alt={me.username ?? me.display_name ?? "avatar"} />}
                <AvatarFallback className="rounded-md bg-muted text-xs font-semibold text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={() => router.push("/account")} className="gap-1.5">
                <User className="h-3.5 w-3.5" />
                Account
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLogoutDialogOpen(true)} className="gap-1.5 text-destructive hover:text-destructive">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => router.push("/login")}>
                Sign in
              </Button>
              <Button size="sm" className="hidden sm:inline-flex" onClick={() => router.push("/register")}>
                Sign up
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md sm:hidden"
                    aria-label="Open account menu"
                  >
                    <Avatar key="nav-signed-out" className="h-9 w-9 rounded-md border border-border">
                      <AvatarFallback className="rounded-md bg-muted text-xs text-foreground">
                        ?
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="border-b border-border px-3 py-3">
                    <p className="text-sm text-muted-foreground">Not signed in</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-sm" onClick={() => router.push("/login")}>
                    <User className="h-4 w-4" />
                    Sign in
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-sm" onClick={() => router.push("/register")}>
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

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
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutDialogOpen(false)
                handleLogout()
              }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  )
}