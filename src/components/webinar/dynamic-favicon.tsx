"use client"

import { useEffect } from "react"

interface DynamicFaviconProps {
  faviconUrl: string | null
}

export function DynamicFavicon({ faviconUrl }: DynamicFaviconProps) {
  useEffect(() => {
    if (!faviconUrl) return

    // Usar abordagem mais segura
    let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement
    let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement

    if (!iconLink) {
      iconLink = document.createElement("link")
      iconLink.rel = "icon"
      document.head.appendChild(iconLink)
    }
    iconLink.href = faviconUrl

    if (!shortcutLink) {
      shortcutLink = document.createElement("link")
      shortcutLink.rel = "shortcut icon"
      document.head.appendChild(shortcutLink)
    }
    shortcutLink.href = faviconUrl

  }, [faviconUrl])

  return null
}
