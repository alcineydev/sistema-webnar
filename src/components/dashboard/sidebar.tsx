"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Link2,
  Settings,
  Users,
  Video,
} from "lucide-react"
import { useState } from "react"

interface Props {
  tenant: {
    name: string
    logoUrl?: string | null
  }
}

const menuItems = [
  { href: "/painel", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/painel/webinars", icon: Video, label: "Webinars" },
  { href: "/painel/leads", icon: Users, label: "Leads" },
  { href: "/painel/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/painel/integracoes", icon: Link2, label: "Integracoes" },
  { href: "/painel/assinatura", icon: CreditCard, label: "Assinatura" },
  { href: "/painel/configuracoes", icon: Settings, label: "Configuracoes" },
]

export function DashboardSidebar({ tenant }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === "/painel") return pathname === "/painel"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`hidden border-r border-slate-200 bg-white transition-all duration-300 md:flex md:flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                {tenant.name.charAt(0)}
              </div>
            )}
            <span className="truncate font-semibold text-slate-900">{tenant.name}</span>
          </div>
        ) : null}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 hover:bg-slate-100"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
