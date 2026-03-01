import type { Metadata } from "next"
import { prismaMaster } from "@/lib/db/master"
import { TenantsList } from "@/components/superadmin/tenants-list"

export const metadata: Metadata = {
  title: "Clientes | Super Admin",
}

export const dynamic = "force-dynamic"

async function getTenants() {
  return prismaMaster.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        include: {
          plan: {
            select: { name: true },
          },
        },
      },
      _count: {
        select: { users: true },
      },
    },
  })
}

export default async function TenantsPage() {
  const tenants = await getTenants()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-500">Gerencie os clientes do Webinar Hub</p>
      </div>

      <TenantsList tenants={tenants} />
    </div>
  )
}
