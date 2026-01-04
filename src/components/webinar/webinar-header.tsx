"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { Video } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

interface WebinarHeaderProps {
  webinarName: string
  webinarSlug: string
  logoUrl?: string | null
  logoLightUrl?: string | null
  logoDarkUrl?: string | null
}

export function WebinarHeader({
  webinarName,
  webinarSlug,
  logoUrl,
  logoLightUrl,
  logoDarkUrl
}: WebinarHeaderProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Selecionar logo baseado no tema
  const currentLogo = mounted
    ? (resolvedTheme === "dark" ? (logoDarkUrl || logoUrl) : (logoLightUrl || logoUrl))
    : logoUrl

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/w/${webinarSlug}`} className="flex items-center gap-3">
          {currentLogo ? (
            <img src={currentLogo} alt={webinarName} className="h-10 object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
              <Video className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <span className="font-semibold text-zinc-900 dark:text-white block">{webinarName}</span>
            <span className="text-xs text-zinc-500">Área do Aluno</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
