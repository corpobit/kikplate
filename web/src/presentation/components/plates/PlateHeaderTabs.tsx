"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type HeaderTab = "readme" | "license" | "files" | "schema" | "content"

interface Props {
  isRepository: boolean
  hasReadme?: boolean
  hasLicense?: boolean
  hasTree?: boolean
  hasGenerate?: boolean
}

export function PlateHeaderTabs({ isRepository, hasReadme = false, hasLicense = false, hasTree = false, hasGenerate = false }: Props) {
  const [active, setActive] = useState<HeaderTab>(isRepository ? "readme" : "content")

  useEffect(() => {
    if (!isRepository) {
      setActive("content")
      return
    }

    const syncFromHash = () => {
      if (window.location.hash === "#files" && hasTree) {
        setActive("files")
        return
      }
      if (window.location.hash === "#schema" && hasGenerate) {
        setActive("schema")
        return
      }
      if (window.location.hash === "#license" && hasLicense) {
        setActive("license")
        return
      }
      if (window.location.hash === "#readme" && hasReadme) {
        setActive("readme")
        return
      }
      setActive(hasReadme ? "readme" : hasLicense ? "license" : hasGenerate ? "schema" : "files")
    }

    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    return () => window.removeEventListener("hashchange", syncFromHash)
  }, [isRepository, hasReadme, hasLicense, hasTree, hasGenerate])

  const setHashWithoutScroll = (tab: "readme" | "license" | "files" | "schema") => {
    setActive(tab)
    const current = window.location.href.split("#")[0]
    window.history.replaceState(window.history.state, "", `${current}#${tab}`)
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  }

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        if (value === "readme" || value === "license" || value === "files" || value === "schema") {
          setHashWithoutScroll(value)
        }
      }}
    >
      <TabsList className="h-auto w-full justify-start overflow-x-auto">
        {isRepository ? (
          <>
            <TabsTrigger value="readme" disabled={!hasReadme} className="px-3">README</TabsTrigger>
            <TabsTrigger value="license" disabled={!hasLicense} className="px-3">License</TabsTrigger>
            <TabsTrigger value="schema" disabled={!hasGenerate} className="px-3">Schema</TabsTrigger>
            <TabsTrigger value="files" disabled={!hasTree} className="px-3">Files</TabsTrigger>
          </>
        ) : (
          <TabsTrigger value="content" disabled className="px-3">
            Content
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  )
}
