import { Sidebar } from "@/components/admin/sidebar"
import { AdminFavicon } from "@/components/admin/admin-favicon"
import { AdminHeader } from "@/components/admin/admin-header"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth guard now lives in middleware to avoid redirect loops on /admin/login.
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminFavicon />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
