import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"
import { TenantSettingsForm } from "@/components/dashboard/tenant-settings-form"

export const metadata: Metadata = {
  title: "Configuracoes | Painel",
}

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect("/login")

  const tenant = await prismaMaster.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      logoUrl: true,
      faviconUrl: true,
      primaryColor: true,
      customDomain: true,
    },
  })

  if (!tenant) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuracoes</h1>
        <p className="text-slate-500">Personalize sua conta</p>
      </div>

      <TenantSettingsForm tenant={tenant} />
    </div>
  )
}
