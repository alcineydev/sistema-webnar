"use client"

import { useEffect, useState } from "react"

export function AdminFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadFavicon() {
      try {
        const response = await fetch("/api/admin/settings")
        if (!response.ok) return

        const data = await response.json()
        if (isMounted && data.adminFaviconUrl) {
          setFaviconUrl(data.adminFaviconUrl)
        }
      } catch {
        // Silenciar erro - favicon é opcional
      }
    }

    loadFavicon()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!faviconUrl) return

    // Usar uma abordagem mais segura - apenas atualizar href dos links existentes
    // ou criar novos se não existirem
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
