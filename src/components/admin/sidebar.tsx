"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Play,
  Webhook,
  BarChart3
} from "lucide-react"
import { signOut } from "next-auth/react"

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const webinarId = params?.id as string | undefined

  // Verifica se está dentro de um webinar específico
  const isInsideWebinar = pathname.includes("/admin/webinars/") && webinarId

  const globalMenuItems: MenuItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/webinars", label: "Webinars", icon: Video },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  ]

  const webinarMenuItems: MenuItem[] = [
    { href: `/admin/webinars/${webinarId}`, label: "Dashboard", icon: BarChart3, exact: true },
    { href: `/admin/webinars/${webinarId}/aulas`, label: "Aulas", icon: Play },
    { href: `/admin/webinars/${webinarId}/leads`, label: "Leads", icon: Users },
    { href: `/admin/webinars/${webinarId}/webhooks`, label: "Webhooks", icon: Webhook },
    { href: `/admin/webinars/${webinarId}/configuracoes`, label: "Configurações", icon: Settings },
  ]

  const menuItems = isInsideWebinar ? webinarMenuItems : globalMenuItems

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200">
      <div className="flex h-full flex-col">
        {/* Logo / Header */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          {isInsideWebinar ? (
            <Link
              href="/admin/webinars"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </Link>
          ) : (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                <Video className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900">Webinar</span>
            </>
          )}
        </div>

        {/* Título do contexto */}
        {isInsideWebinar && (
          <div className="px-6 py-3 border-b border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Webinar</p>
            <p className="text-sm font-medium text-slate-900 truncate">Gerenciando</p>
          </div>
        )}

        {/* Menu Principal */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isInsideWebinar ? "Menu do Webinar" : "Menu Principal"}
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}
