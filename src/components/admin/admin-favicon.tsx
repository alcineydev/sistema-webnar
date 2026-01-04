"use client"

import { useEffect, useState } from "react"

export function AdminFavicon() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadFavicon() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()
        setFaviconUrl(data.adminFaviconUrl || null)
      } catch (error) {
        console.error("Error loading favicon:", error)
      }
    }

    loadFavicon()
  }, [])

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
