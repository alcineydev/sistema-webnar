"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  BarChart3,
  Bell,
  HelpCircle,
} from "lucide-react"

const menuItems = [
  {
    title: "Menu Principal",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Webinars", href: "/admin/webinars", icon: Video },
      { name: "Leads", href: "/admin/leads", icon: Users },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Configurações",
    items: [
      { name: "Notificações", href: "/admin/notifications", icon: Bell },
      { name: "Configurações", href: "/admin/settings", icon: Settings },
      { name: "Ajuda", href: "/admin/help", icon: HelpCircle },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Webinar</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 px-3 py-6">
          {menuItems.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href))
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <p className="text-sm font-medium">Precisa de ajuda?</p>
            <p className="mt-1 text-xs opacity-80">
              Acesse nossa documentação
            </p>
            <button className="mt-3 w-full rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30 transition">
              Ver docs
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
