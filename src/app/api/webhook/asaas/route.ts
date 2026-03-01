import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from ".prisma/master"
import { prismaMaster } from "@/lib/db/master"
import { processPaymentWebhook } from "@/lib/payment/subscription-service"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("asaas-access-token")
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.error("[Asaas Webhook] Token invalido")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = (await request.json()) as {
      event?: string
      payment?: {
        id: string
        status: string
        value: number
        netValue: number
      }
    }

    await prismaMaster.paymentWebhook.create({
      data: {
        source: "asaas",
        event: payload.event || "unknown",
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    })

    if (payload.event?.startsWith("PAYMENT_") && payload.payment) {
      await processPaymentWebhook(
        payload.payment.id,
        payload.payment.status,
        payload.payment.value,
        payload.payment.netValue
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Asaas Webhook] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
