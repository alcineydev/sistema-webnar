import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from ".prisma/master"
import { prismaMaster } from "@/lib/db/master"

export const dynamic = "force-dynamic"

type WebhookSource = "hotmart" | "kiwify" | "ticto" | "cartpanda"

interface NormalizedPayment {
  email: string
  name: string
  status: "approved" | "refunded" | "cancelled" | "pending"
  value: number
  externalId: string
  planSlug?: string
}

type JsonObject = Record<string, unknown>

function safeString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function asObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null ? (value as JsonObject) : {}
}

function validateWebhook(source: WebhookSource, payload: string, signature: string): boolean {
  const secrets: Record<WebhookSource, string | undefined> = {
    hotmart: process.env.WEBHOOK_SECRET_HOTMART,
    kiwify: process.env.WEBHOOK_SECRET_KIWIFY,
    ticto: process.env.WEBHOOK_SECRET_TICTO,
    cartpanda: process.env.WEBHOOK_SECRET_CARTPANDA,
  }

  const secret = secrets[source]
  if (!secret) return true
  if (!signature) return false

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  const provided = signature.replace(/^sha256=/i, "")

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  } catch {
    return false
  }
}

function normalizeHotmart(payload: JsonObject): NormalizedPayment {
  const directBuyer = asObject(payload.buyer)
  const nestedData = asObject(payload.data)
  const nestedBuyer = asObject(nestedData.buyer)

  const directPurchase = asObject(payload.purchase)
  const nestedPurchase = asObject(nestedData.purchase)
  const purchasePrice = asObject(directPurchase.price || nestedPurchase.price)

  const directProduct = asObject(payload.product)
  const nestedProduct = asObject(nestedData.product)

  const buyer = Object.keys(directBuyer).length ? directBuyer : nestedBuyer
  const purchase = Object.keys(directPurchase).length ? directPurchase : nestedPurchase
  const product = Object.keys(directProduct).length ? directProduct : nestedProduct

  return {
    email: safeString(buyer.email),
    name: safeString(buyer.name),
    status:
      safeString(payload.status) === "approved"
        ? "approved"
        : safeString(payload.status) === "refunded"
          ? "refunded"
          : "pending",
    value: toNumber(purchasePrice.value),
    externalId: safeString(purchase.transaction),
    planSlug: safeString(product?.name).toLowerCase().replace(/\s+/g, "-"),
  }
}

function normalizeKiwify(payload: JsonObject): NormalizedPayment {
  const customer = asObject(payload.Customer)
  const commissions = asObject(payload.Commissions)
  const product = asObject(payload.Product)

  return {
    email: safeString(customer.email),
    name: safeString(customer.full_name),
    status:
      safeString(payload.order_status) === "paid"
        ? "approved"
        : safeString(payload.order_status) === "refunded"
          ? "refunded"
          : "pending",
    value: toNumber(commissions.charge_amount),
    externalId: safeString(payload.order_id),
    planSlug: safeString(product.product_name).toLowerCase().replace(/\s+/g, "-"),
  }
}

function normalizeTicto(payload: JsonObject): NormalizedPayment {
  const customer = asObject(payload.customer)
  return {
    email: safeString(customer.email),
    name: safeString(customer.name),
    status:
      safeString(payload.status) === "approved"
        ? "approved"
        : safeString(payload.status) === "refunded"
          ? "refunded"
          : "pending",
    value: toNumber(payload.amount),
    externalId: safeString(payload.transaction_id),
  }
}

function normalizeCartpanda(payload: JsonObject): NormalizedPayment {
  const customer = asObject(payload.customer)
  return {
    email: safeString(customer.email),
    name: safeString(customer.name),
    status:
      safeString(payload.status) === "paid"
        ? "approved"
        : safeString(payload.status) === "refunded"
          ? "refunded"
          : "pending",
    value: toNumber(payload.total),
    externalId: safeString(payload.order_id),
  }
}

export async function POST(request: NextRequest) {
  try {
    const source = request.nextUrl.searchParams.get("source") as WebhookSource
    if (!source || !["hotmart", "kiwify", "ticto", "cartpanda"].includes(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 })
    }

    const rawPayload = await request.text()
    const signature =
      request.headers.get("x-signature") ||
      request.headers.get("x-hub-signature") ||
      request.headers.get("x-webhook-signature") ||
      ""

    if (!validateWebhook(source, rawPayload, signature)) {
      console.error(`[${source} Webhook] Assinatura invalida`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(rawPayload) as JsonObject

    await prismaMaster.paymentWebhook.create({
      data: {
        source,
        event: safeString(payload.event || payload.status || "unknown"),
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    })

    let normalized: NormalizedPayment
    switch (source) {
      case "hotmart":
        normalized = normalizeHotmart(payload)
        break
      case "kiwify":
        normalized = normalizeKiwify(payload)
        break
      case "ticto":
        normalized = normalizeTicto(payload)
        break
      case "cartpanda":
        normalized = normalizeCartpanda(payload)
        break
    }

    if (normalized.status === "approved" && normalized.email) {
      const tenant = await prismaMaster.tenant.findFirst({
        where: { email: normalized.email },
        include: { subscription: true },
      })

      if (tenant?.subscription) {
        await prismaMaster.subscription.update({
          where: { id: tenant.subscription.id },
          data: { status: "active" },
        })

        await prismaMaster.tenant.update({
          where: { id: tenant.id },
          data: { status: "active" },
        })

        await prismaMaster.payment.create({
          data: {
            subscriptionId: tenant.subscription.id,
            amount: normalized.value,
            netAmount: normalized.value,
            status: "confirmed",
            billingType: "EXTERNAL",
            source,
            externalId: normalized.externalId,
            paymentDate: new Date(),
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[External Webhook] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
