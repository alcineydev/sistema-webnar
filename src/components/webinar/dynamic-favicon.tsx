"use client"

import { useEffect } from "react"

interface DynamicFaviconProps {
  faviconUrl: string | null
}

export function DynamicFavicon({ faviconUrl }: DynamicFaviconProps) {
  useEffect(() => {
    if (!faviconUrl) return

    // Remover favicons existentes
    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach(link => link.remove())

    // Adicionar novo favicon
    const link = document.createElement("link")
    link.rel = "icon"
    link.href = faviconUrl
    document.head.appendChild(link)

    const shortcut = document.createElement("link")
    shortcut.rel = "shortcut icon"
    shortcut.href = faviconUrl
    document.head.appendChild(shortcut)

    return () => {
      link.remove()
      shortcut.remove()
    }
  }, [faviconUrl])

  return null
}
