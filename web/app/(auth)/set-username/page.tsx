"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMe } from "@/src/presentation/hooks/useAuth"
import { useMounted } from "@/src/presentation/hooks/useMounted"
import { LoadingSpinner } from "@/src/presentation/components/common/LoadingSpinner"
import { AlertCircle, Loader2 } from "lucide-react"
import { http } from "@/src/data/repositories/httpClient"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetUsernamePage() {
  const router = useRouter()
  const mounted = useMounted()
  const { data: me, isLoading } = useMe()
  const qc = useQueryClient()

  const [username, setUsername] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (me?.username) {
      router.replace("/")
    }
  }, [me?.username, router])

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (me?.username) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    try {
      await http.patch("/me/username", { username })
      await qc.invalidateQueries({ queryKey: ["me"] })
      router.replace("/")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsPending(false)
    }
  }

  const isValid = /^[a-z0-9_-]{3,32}$/.test(username)

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 border border-border bg-card p-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Choose a username</h1>
          <p className="text-sm text-muted-foreground">
            Your username identifies you on KikPlate and is used as the{" "}
            <code className="font-mono bg-muted px-1 py-0.5 text-xs">owner</code>{" "}
            field in <code className="font-mono bg-muted px-1 py-0.5 text-xs">plate.yaml</code>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="e.g. moeidheidari"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              maxLength={32}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              3–32 characters. Letters, numbers, hyphens, underscores only.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="inline-flex items-start gap-2 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isPending || !isValid}
            className="w-full gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save username
          </Button>
        </form>

      </div>
    </div>
  )
}