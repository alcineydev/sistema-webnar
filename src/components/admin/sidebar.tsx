"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/webinars", label: "Webinars", icon: Video },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900">Webinar</span>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
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
