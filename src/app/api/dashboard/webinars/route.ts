import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { checkLimit, getTenantPlanLimits, getTenantUsage } from "@/lib/plan-limits"

export const dynamic = "force-dynamic"

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function mapWebinarStatus(value?: string) {
  return value === "published" ? "PUBLISHED" : "DRAFT"
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
    }

    const webinars = await tenantContext.prisma.webinar.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { lessons: true, leads: true },
        },
      },
    })

    return NextResponse.json(webinars)
  } catch (error) {
    console.error("[Webinars GET] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
    }

    const limits = await getTenantPlanLimits(session.user.tenantId)
    const usage = await getTenantUsage(session.user.tenantId, tenantContext.prisma)
    if (limits) {
      const validation = checkLimit(usage.webinars, limits.maxWebinars, "webinars")
      if (!validation.allowed) {
        return NextResponse.json({ error: validation.message }, { status: 403 })
      }
    }

    const data = (await request.json()) as {
      name?: string
      slug?: string
      description?: string | null
      bannerUrl?: string | null
      logoUrl?: string | null
      primaryColor?: string | null
      status?: string
    }

    const slug = normalizeSlug(data.slug || "")
    if (!data.name || !slug) {
      return NextResponse.json({ error: "Nome e slug sao obrigatorios" }, { status: 400 })
    }

    const existing = await tenantContext.prisma.webinar.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug ja existe" }, { status: 400 })
    }

    const webinar = await tenantContext.prisma.webinar.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        bannerUrl: data.bannerUrl || null,
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor || null,
        status: mapWebinarStatus(data.status),
      },
    })

    return NextResponse.json(webinar)
  } catch (error) {
    console.error("[Webinars POST] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
