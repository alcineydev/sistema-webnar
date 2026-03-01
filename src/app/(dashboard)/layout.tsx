import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!["admin", "collaborator"].includes(session.user.role)) {
    redirect("/login")
  }

  const tenantContext = await resolveTenantByUserId(session.user.id)

  if (!tenantContext) {
    redirect("/login?error=tenant_inactive")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar tenant={tenantContext.tenant} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} tenant={tenantContext.tenant} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
