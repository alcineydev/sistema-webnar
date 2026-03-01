import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { TenantWebhooks } from "@/components/dashboard/tenant-webhooks"
import { hasPlanFeature } from "@/lib/plan-limits"

export const metadata: Metadata = {
  title: "Integracoes | Painel",
}

export const dynamic = "force-dynamic"

export default async function IntegracoesPage() {
  const session = await auth()
  if (!session?.user?.id || !session.user.tenantId) redirect("/login")

  const tenantContext = await resolveTenantByUserId(session.user.id)
  if (!tenantContext) redirect("/login")

  const [webhooks, canUseWebhooks] = await Promise.all([
    tenantContext.prisma.webhook.findMany({
      orderBy: { createdAt: "desc" },
    }),
    hasPlanFeature(session.user.tenantId, "webhooks"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integracoes</h1>
        <p className="text-slate-500">Gerencie webhooks e conexoes do seu tenant</p>
      </div>

      <TenantWebhooks webhooks={webhooks} canUseWebhooks={canUseWebhooks} />
    </div>
  )
}
