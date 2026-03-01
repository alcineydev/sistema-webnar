import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"
import { requireTenantPlanFeature } from "@/lib/plan-middleware"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const data = (await request.json()) as {
      name?: string
      phone?: string
      logoUrl?: string
      faviconUrl?: string
      primaryColor?: string
      customDomain?: string
    }

    if (data.customDomain) {
      try {
        await requireTenantPlanFeature(session.user.tenantId, "customDomain")
      } catch {
        return NextResponse.json(
          { error: "Seu plano atual nao permite dominio personalizado" },
          { status: 403 }
        )
      }
    }

    if (data.customDomain) {
      const existing = await prismaMaster.tenant.findFirst({
        where: {
          customDomain: data.customDomain,
          NOT: { id: session.user.tenantId },
        },
      })

      if (existing) {
        return NextResponse.json({ error: "Dominio ja em uso" }, { status: 400 })
      }
    }

    await prismaMaster.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        name: data.name,
        phone: data.phone || null,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        primaryColor: data.primaryColor || null,
        customDomain: data.customDomain || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Settings] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
