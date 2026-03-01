import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { requireTenantPlanFeature } from "@/lib/plan-middleware"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 404 })
    }

    const webhooks = await tenantContext.prisma.webhook.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error("[Dashboard Webhooks GET] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    try {
      await requireTenantPlanFeature(session.user.tenantId, "webhooks")
    } catch {
      return NextResponse.json(
        { error: "Seu plano nao possui recurso de webhooks" },
        { status: 403 }
      )
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 404 })
    }

    const payload = (await request.json()) as {
      name?: string
      url?: string
      events?: string[]
      secret?: string | null
    }

    if (!payload.name || !payload.url) {
      return NextResponse.json({ error: "Nome e URL sao obrigatorios" }, { status: 400 })
    }

    const firstWebinar = await tenantContext.prisma.webinar.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })

    if (!firstWebinar) {
      return NextResponse.json(
        { error: "Crie ao menos um webinar antes de cadastrar webhooks" },
        { status: 400 }
      )
    }

    const created = await tenantContext.prisma.webhook.create({
      data: {
        name: payload.name,
        url: payload.url,
        events: payload.events?.length ? payload.events : ["lead.created"],
        secret: payload.secret || null,
        isActive: true,
        webinarId: firstWebinar.id,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error("[Dashboard Webhooks POST] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
