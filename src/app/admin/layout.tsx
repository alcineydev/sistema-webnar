import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
