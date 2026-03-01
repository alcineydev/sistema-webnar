import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"
import { asaas } from "@/lib/payment/asaas"

export const dynamic = "force-dynamic"

function getPlanPriceByCycle(
  billingCycle: string,
  prices: { monthly: number; quarterly: number | null; yearly: number | null }
) {
  if (billingCycle === "quarterly") return prices.quarterly || prices.monthly * 3
  if (billingCycle === "yearly") return prices.yearly || prices.monthly * 12
  return prices.monthly
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { planId } = (await request.json()) as { planId?: string }
    if (!planId) {
      return NextResponse.json({ error: "Plano obrigatorio" }, { status: 400 })
    }

    const newPlan = await prismaMaster.plan.findUnique({
      where: { id: planId },
    })
    if (!newPlan || !newPlan.isActive) {
      return NextResponse.json({ error: "Plano nao encontrado" }, { status: 400 })
    }

    const subscription = await prismaMaster.subscription.findUnique({
      where: { tenantId: session.user.tenantId },
    })
    if (!subscription) {
      return NextResponse.json({ error: "Assinatura nao encontrada" }, { status: 400 })
    }

    const price = getPlanPriceByCycle(subscription.billingCycle, {
      monthly: newPlan.priceMonthly,
      quarterly: newPlan.priceQuarterly,
      yearly: newPlan.priceYearly,
    })

    if (subscription.asaasSubscriptionId) {
      await asaas.updateSubscription(subscription.asaasSubscriptionId, {
        value: price,
      })
    }

    await prismaMaster.subscription.update({
      where: { id: subscription.id },
      data: { planId: newPlan.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Subscription Upgrade] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
