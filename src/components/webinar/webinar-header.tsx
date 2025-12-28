"use client"

import { Video } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

interface WebinarHeaderProps {
  webinarName: string
}

export function WebinarHeader({ webinarName }: WebinarHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white">{webinarName}</h1>
            <p className="text-xs text-slate-400">Área do Aluno</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
