import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { checkLimit, getTenantPlanLimits } from "@/lib/plan-limits"

export const dynamic = "force-dynamic"

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.tenantId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const tenantContext = await resolveTenantByUserId(session.user.id)
    if (!tenantContext) {
      return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 })
    }

    const webinar = await tenantContext.prisma.webinar.findUnique({
      where: { id: params.id },
      select: { id: true },
    })
    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    const limits = await getTenantPlanLimits(session.user.tenantId)
    if (limits) {
      const currentLessons = await tenantContext.prisma.lesson.count({
        where: { webinarId: params.id },
      })
      const validation = checkLimit(currentLessons, limits.maxLessons, "aulas por webinar")
      if (!validation.allowed) {
        return NextResponse.json({ error: validation.message }, { status: 403 })
      }
    }

    const data = (await request.json()) as {
      title?: string
      slug?: string
      videoUrl?: string
      order?: number
      isActive?: boolean
      offerUrl?: string
      offerButtonText?: string
      offerShowAt?: number
    }

    const slug = normalizeSlug(data.slug || "")
    if (!data.title || !slug || !data.videoUrl) {
      return NextResponse.json(
        { error: "Titulo, slug e URL do video sao obrigatorios" },
        { status: 400 }
      )
    }

    const existing = await tenantContext.prisma.lesson.findUnique({
      where: {
        webinarId_slug: {
          webinarId: params.id,
          slug,
        },
      },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug da aula ja existe neste webinar" }, { status: 400 })
    }

    const lesson = await tenantContext.prisma.lesson.create({
      data: {
        webinarId: params.id,
        title: data.title,
        slug,
        videoUrl: data.videoUrl,
        order: data.order || 1,
        isActive: data.isActive ?? true,
        offerUrl: data.offerUrl || null,
        offerButtonText: data.offerButtonText || null,
        offerShowAt: data.offerShowAt || null,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("[Lessons POST] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
