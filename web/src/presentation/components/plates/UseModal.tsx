"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Check, Terminal } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onClose: () => void
  repoUrl?: string
  slug: string
  generateCommand?: string
}

function CopyField({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-0 border border-border rounded-lg overflow-hidden">
        <code className="flex-1 break-all bg-muted/20 px-3 py-2.5 text-xs font-mono text-foreground">
          {value}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="rounded-r-lg border-l border-border"
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-green-500" />
            : <Copy className="h-3.5 w-3.5" />
          }
        </Button>
      </div>
    </div>
  )
}

export function UseModal({ open, onClose, slug, generateCommand }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use this plate</DialogTitle>
          <DialogDescription>
            Choose how you want to use this template:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <CopyField
            label="Scaffold with kik CLI"
            icon={<Terminal className="h-3.5 w-3.5" />}
            value={`kik scaf ${slug}`}
          />

          {generateCommand ? (
            <CopyField
              label="Generate with kik CLI"
              icon={<Terminal className="h-3.5 w-3.5" />}
              value={generateCommand}
            />
          ) : null}

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have the CLI?{" "}
              <Link
                href="/docs?doc=cli"
                onClick={onClose}
                className="text-foreground underline underline-offset-4 hover:text-foreground/90"
              >
                Install kik
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}