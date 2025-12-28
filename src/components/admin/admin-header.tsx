"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Video, LayoutDashboard, Loader2 } from "lucide-react"

export function AdminHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Na página de login, não mostra header
  if (pathname === "/admin/login") {
    return null
  }

  // Mostra loading enquanto carrega a sessão
  if (status === "loading") {
    return (
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-slate-900">
              Sistema Webinar
            </h1>
            <nav className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <Video className="w-4 h-4" />
                Webinars
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        </div>
      </header>
    )
  }

  // Se não tem sessão após carregar, não mostra header (vai redirecionar para login)
  if (!session) {
    return null
  }

  // Mostra header completo com sessão carregada
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Sistema Webinar
          </h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/webinars"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Video className="w-4 h-4" />
              Webinars
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {session.user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
