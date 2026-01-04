"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Video,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"

interface AdminSettings {
  adminLogoType?: string
  adminLogoUrl?: string
  adminLogoHeight?: string
  adminLogoText?: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [settings, setSettings] = useState<AdminSettings>({})
  const [isOpen, setIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoaded(true)
      }
    }

    loadSettings()
  }, [])

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/webinars", icon: Video, label: "Webinars" },
    { href: "/admin/leads", icon: Users, label: "Leads" },
    { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const logoType = settings.adminLogoType || "text"
  const logoUrl = settings.adminLogoUrl
  const logoHeight = settings.adminLogoHeight || "32"
  const logoText = settings.adminLogoText || "Sistema Webinar"

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Texto */}
          <div className="p-6 border-b border-slate-100">
            {loaded && logoType === "logo" && logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                style={{ height: `${logoHeight}px` }}
                className="object-contain"
              />
            ) : (
              <h1 className="text-xl font-bold text-slate-900">
                {logoText}
              </h1>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
