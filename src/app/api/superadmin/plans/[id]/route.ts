import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"

export const dynamic = "force-dynamic"

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const plan = await prismaMaster.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plano nao encontrado" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("[Plan GET] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const data = (await request.json()) as Record<string, unknown>
    const slug = String(data.slug || "").trim().toLowerCase()

    const existing = await prismaMaster.plan.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Slug ja existe" }, { status: 400 })
    }

    const plan = await prismaMaster.plan.update({
      where: { id: params.id },
      data: {
        name: String(data.name || ""),
        slug,
        description: (data.description as string) || null,
        priceMonthly: Number(data.priceMonthly || 0),
        priceQuarterly: toNullableNumber(data.priceQuarterly),
        priceYearly: toNullableNumber(data.priceYearly),
        maxWebinars: Number(data.maxWebinars || 0),
        maxLessons: Number(data.maxLessons || 0),
        maxLeadsMonth: Number(data.maxLeadsMonth || 0),
        maxStorageGB: Number(data.maxStorageGB || 0),
        maxUsers: Number(data.maxUsers || 1),
        customDomain: Boolean(data.customDomain),
        whiteLabel: Boolean(data.whiteLabel),
        webhooks: Boolean(data.webhooks),
        pixels: Boolean(data.pixels),
        prioritySupport: Boolean(data.prioritySupport),
        isPopular: Boolean(data.isPopular),
        isActive: data.isActive === undefined ? true : Boolean(data.isActive),
        sortOrder: Number(data.sortOrder || 0),
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error("[Plan PUT] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const subscriptions = await prismaMaster.subscription.count({
      where: { planId: params.id },
    })

    if (subscriptions > 0) {
      return NextResponse.json(
        { error: "Nao e possivel excluir plano com assinaturas ativas" },
        { status: 400 }
      )
    }

    await prismaMaster.plan.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Plan DELETE] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
