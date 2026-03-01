import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"
import { SubscriptionDetails } from "@/components/dashboard/subscription-details"

export const metadata: Metadata = {
  title: "Assinatura | Painel",
}

export const dynamic = "force-dynamic"

async function getSubscriptionData(tenantId: string) {
  const subscription = await prismaMaster.subscription.findUnique({
    where: { tenantId },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  const plans = await prismaMaster.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  return { subscription, plans }
}

export default async function SubscriptionPage() {
  const session = await auth()
  if (!session?.user?.tenantId) redirect("/login")

  const { subscription, plans } = await getSubscriptionData(session.user.tenantId)

  if (!subscription) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Nenhuma assinatura encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assinatura</h1>
        <p className="text-slate-500">Gerencie seu plano e pagamentos</p>
      </div>

      <SubscriptionDetails subscription={subscription} plans={plans} />
    </div>
  )
}
