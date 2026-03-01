import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"

export const dynamic = "force-dynamic"

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const plans = await prismaMaster.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("[Plans GET] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const data = (await request.json()) as Record<string, unknown>

    const slug = String(data.slug || "").trim().toLowerCase()
    if (!slug) {
      return NextResponse.json({ error: "Slug obrigatorio" }, { status: 400 })
    }

    const existing = await prismaMaster.plan.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json({ error: "Slug ja existe" }, { status: 400 })
    }

    const plan = await prismaMaster.plan.create({
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
    console.error("[Plans POST] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
