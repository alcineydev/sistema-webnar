"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Link2,
  Settings,
  Users,
  Wallet,
} from "lucide-react"

const menuItems = [
  { href: "/superadmin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/superadmin/clientes", icon: Users, label: "Clientes" },
  { href: "/superadmin/planos", icon: CreditCard, label: "Planos" },
  { href: "/superadmin/pagamentos", icon: Wallet, label: "Pagamentos" },
  { href: "/superadmin/paginas", icon: FileText, label: "Paginas" },
  { href: "/superadmin/integracoes", icon: Link2, label: "Integracoes" },
  { href: "/superadmin/configuracoes", icon: Settings, label: "Configuracoes" },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/superadmin") return pathname === "/superadmin"
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600" />
          <div>
            <p className="font-semibold">Webinar Hub</p>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
