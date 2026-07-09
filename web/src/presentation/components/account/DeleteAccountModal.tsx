"use client"

import { useState } from "react"
import { TriangleAlert, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDeleteMe } from "@/src/presentation/hooks/useAuth"

interface Props {
  username: string
  onClose: () => void
  onDeleted: () => void
}

export function DeleteAccountModal({ username, onClose, onDeleted }: Props) {
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const deleteMe = useDeleteMe()
  const deleting = deleteMe.isPending
  const canDelete = confirm === username

  async function handleDelete() {
    if (!canDelete) return
    setError(null)
    try {
      await deleteMe.mutateAsync()
      onDeleted()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete account")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete account</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            All your plates, reviews, and data will be deleted. Other users' forks and uses of your plates will remain.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
            Type <span className="font-mono font-semibold text-foreground">{username}</span> to confirm
          </label>
          <Input
            id="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={username}
            autoComplete="off"
            className="font-mono"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || deleting}
          >
            {deleting && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
            Delete my account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}