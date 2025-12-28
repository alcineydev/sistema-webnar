"use client"

import { ThemeToggle } from "./theme-toggle"
import { Video } from "lucide-react"
import Link from "next/link"

interface WebinarHeaderProps {
  webinarName: string
  webinarSlug: string
  logoUrl?: string | null
}

export function WebinarHeader({ webinarName, webinarSlug, logoUrl }: WebinarHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/90">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/w/${webinarSlug}`} className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={webinarName} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
              <Video className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <span className="font-semibold text-white block">{webinarName}</span>
            <span className="text-xs text-zinc-500">Área do Aluno</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
