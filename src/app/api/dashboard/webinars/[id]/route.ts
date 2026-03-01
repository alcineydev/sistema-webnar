import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
    }

    const webinar = await tenantContext.prisma.webinar.findUnique({
      where: { id: params.id },
      include: {
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { leads: true } },
      },
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    return NextResponse.json(webinar)
  } catch (error) {
    console.error("[Webinar GET] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
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

    const existing = await tenantContext.prisma.webinar.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug ja existe" }, { status: 400 })
    }

    const webinar = await tenantContext.prisma.webinar.update({
      where: { id: params.id },
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
    console.error("[Webinar PUT] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
    }

    await tenantContext.prisma.webinar.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Webinar DELETE] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
