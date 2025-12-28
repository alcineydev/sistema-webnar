"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/webinars": "Webinars",
  "/admin/webinars/new": "Novo Webinar",
  "/admin/leads": "Leads",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Configurações",
}

export function AdminHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    if (pathname.startsWith("/admin/webinars/") && pathname.includes("/lessons")) return "Aulas"
    if (pathname.startsWith("/admin/webinars/")) return "Editar Webinar"
    return "Admin"
  }

  if (status === "loading") {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar..."
            className="w-64 pl-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                <span className="text-sm font-medium text-indigo-600">
                  {session?.user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-slate-700">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-slate-500">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
