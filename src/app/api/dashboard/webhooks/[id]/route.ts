import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { requireTenantPlanFeature } from "@/lib/plan-middleware"

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const payload = (await request.json()) as { isActive?: boolean }

    const updated = await tenantContext.prisma.webhook.update({
      where: { id: params.id },
      data: { isActive: Boolean(payload.isActive) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[Dashboard Webhooks PUT] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await tenantContext.prisma.webhook.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Dashboard Webhooks DELETE] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
