"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, LogOut, User, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface WebinarHeaderProps {
  webinarName: string
  webinarSlug: string
  logoUrl: string | null
  logoLightUrl?: string | null
  logoDarkUrl?: string | null
  leadName?: string
}

export function WebinarHeader({
  webinarName,
  webinarSlug,
  logoUrl,
  logoLightUrl,
  logoDarkUrl,
  leadName
}: WebinarHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLogo = mounted
    ? (resolvedTheme === "dark" ? (logoDarkUrl || logoUrl) : (logoLightUrl || logoUrl))
    : logoUrl

  async function handleLogout() {
    try {
      // Limpar cookie do lead
      document.cookie.split(";").forEach((c) => {
        if (c.trim().startsWith("lead_")) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        }
      })

      // Redirecionar para a página inicial do webinar
      router.push(`/w/${webinarSlug}`)
      router.refresh()
    } catch (error) {
      console.error("Erro ao deslogar:", error)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {currentLogo ? (
            <img
              src={currentLogo}
              alt={webinarName}
              className="h-8 object-contain"
            />
          ) : (
            <span className="font-semibold text-slate-900 dark:text-white">
              {webinarName}
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Alternar tema"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5 text-zinc-400 hover:text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 hover:text-indigo-600" />
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              {leadName && (
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  {leadName.split(" ")[0]}
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700 py-1 z-20">
                  {leadName && (
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {leadName}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
