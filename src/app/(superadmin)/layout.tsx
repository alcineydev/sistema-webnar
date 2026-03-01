import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SuperAdminHeader } from "@/components/superadmin/header"
import { SuperAdminSidebar } from "@/components/superadmin/sidebar"

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "superadmin") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
