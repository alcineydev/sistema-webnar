"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Play, Users, Webhook, Settings } from "lucide-react"

interface WebinarTabsProps {
  webinarId: string
}

export function WebinarTabs({ webinarId }: WebinarTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { href: `/admin/webinars/${webinarId}`, label: "Dashboard", icon: BarChart3, exact: true },
    { href: `/admin/webinars/${webinarId}/aulas`, label: "Aulas", icon: Play },
    { href: `/admin/webinars/${webinarId}/leads`, label: "Leads", icon: Users },
    { href: `/admin/webinars/${webinarId}/webhooks`, label: "Webhooks", icon: Webhook },
    { href: `/admin/webinars/${webinarId}/configuracoes`, label: "Configurações", icon: Settings },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="border-b border-slate-200 bg-white -mx-6 -mt-6 px-6 mb-6">
      <nav className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href, tab.exact)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
