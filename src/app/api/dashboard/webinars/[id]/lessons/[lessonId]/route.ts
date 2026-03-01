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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
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

    const lessonExists = await tenantContext.prisma.lesson.findFirst({
      where: {
        id: params.lessonId,
        webinarId: params.id,
      },
      select: { id: true },
    })
    if (!lessonExists) {
      return NextResponse.json({ error: "Aula nao encontrada" }, { status: 404 })
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

    const existing = await tenantContext.prisma.lesson.findFirst({
      where: {
        webinarId: params.id,
        slug,
        NOT: { id: params.lessonId },
      },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug da aula ja existe neste webinar" }, { status: 400 })
    }

    const lesson = await tenantContext.prisma.lesson.update({
      where: { id: params.lessonId },
      data: {
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
    console.error("[Lesson PUT] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
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

    const lessonExists = await tenantContext.prisma.lesson.findFirst({
      where: {
        id: params.lessonId,
        webinarId: params.id,
      },
      select: { id: true },
    })
    if (!lessonExists) {
      return NextResponse.json({ error: "Aula nao encontrada" }, { status: 404 })
    }

    await tenantContext.prisma.lesson.delete({
      where: { id: params.lessonId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Lesson DELETE] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
