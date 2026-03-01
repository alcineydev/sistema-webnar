"use client"

import Link from "next/link"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react"

interface Props {
  user: {
    name: string
    email: string
    role: string
    id: string
    tenantId: string | null
  }
}

export function SuperAdminHeader({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-slate-200 bg-white px-8">
      <button className="rounded-lg p-2 transition-colors hover:bg-slate-100">
        <Bell className="h-5 w-5 text-slate-600" />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {menuOpen ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <Link
                href="/superadmin/configuracoes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Configuracoes
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}
