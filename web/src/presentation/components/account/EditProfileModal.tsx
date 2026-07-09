"use client"

import Image from "next/image"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { MeResult } from "@/src/domain/entities/User"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSetUsername, useUpdateProfile } from "@/src/presentation/hooks/useAuth"

interface Props {
  me: MeResult
  onClose: () => void
  onSaved: () => void
}

export function EditProfileModal({ me, onClose, onSaved }: Props) {
  const [username, setUsername] = useState(me.username ?? "")
  const [displayName, setDisplayName] = useState(me.display_name ?? "")
  const [avatarUrl, setAvatarUrl] = useState(me.avatar_url ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setUsernameMutation = useSetUsername()
  const updateProfileMutation = useUpdateProfile()

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (me.provider === "local" && me.username && username.trim() && username.trim() !== me.username) {
        await setUsernameMutation.mutateAsync(username.trim())
      }

      await updateProfileMutation.mutateAsync({
        display_name: displayName.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      })

      onSaved()
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              disabled={me.provider !== "local"}
            />
            {me.provider !== "local" && (
              <p className="text-xs text-muted-foreground">
                Username is managed by your {me.provider} account.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">
              Display name
            </label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="avatarUrl" className="text-xs font-medium text-muted-foreground">
              Avatar URL
            </label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {avatarUrl && (
            <div className="flex items-center gap-3">
              <Image
                src={avatarUrl}
                alt="Preview"
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 object-cover border border-border rounded-lg"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="text-xs text-muted-foreground">Avatar preview</span>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}