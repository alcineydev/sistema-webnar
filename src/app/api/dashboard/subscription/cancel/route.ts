import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"
import { cancelSubscription } from "@/lib/payment/subscription-service"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const subscription = await prismaMaster.subscription.findUnique({
      where: { tenantId: session.user.tenantId },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Assinatura nao encontrada" }, { status: 400 })
    }

    await cancelSubscription(subscription.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Subscription Cancel] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
