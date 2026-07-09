"use client"

import { Github, Chrome, Gitlab } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authRepository } from "@/src/data/repositories/AuthRepository"

const providerConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  github: {
    label: "GitHub",
    icon: <Github className="h-4 w-4" />,
  },
  google: {
    label: "Google",
    icon: <Chrome className="h-4 w-4" />,
  },
  gitlab: {
    label: "GitLab",
    icon: <Gitlab className="h-4 w-4" />,
  },
}

interface Props {
  provider: string
}

export function OAuthButton({ provider }: Props) {
  const config = providerConfig[provider] ?? {
    label: provider.charAt(0).toUpperCase() + provider.slice(1),
    icon: null,
  }

  function handleClick() {
    window.location.href = authRepository.oauthRedirectURL(provider)
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full gap-2"
    >
      {config.icon}
      Continue with {config.label}
    </Button>
  )
}