import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { resolveTenantBySlug } from "@/lib/db/resolve-tenant"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string; webinarId: string } }
) {
  try {
    const tenantContext = await resolveTenantBySlug(params.tenant)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
    }

    const data = (await request.json()) as {
      name?: string
      email?: string
      phone?: string
    }

    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Nome e email sao obrigatorios" }, { status: 400 })
    }

    const webinar = await tenantContext.prisma.webinar.findUnique({
      where: { id: params.webinarId },
      select: { id: true, slug: true },
    })
    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    let lead = await tenantContext.prisma.lead.findFirst({
      where: {
        webinarId: params.webinarId,
        email: data.email,
      },
    })

    if (!lead) {
      lead = await tenantContext.prisma.lead.create({
        data: {
          webinarId: params.webinarId,
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          status: "ACTIVE",
          firstAccessAt: new Date(),
          lastAccessAt: new Date(),
        },
      })

      await tenantContext.prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          eventType: "LEAD_REGISTERED",
          data: { webinarSlug: webinar.slug },
        },
      })
    } else {
      await tenantContext.prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastAccessAt: new Date(),
          name: data.name || lead.name,
          phone: data.phone || lead.phone,
        },
      })
    }

    const cookieStore = cookies()
    cookieStore.set(`lead_${params.tenant}_${webinar.slug}`, lead.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error("[Lead Register] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
