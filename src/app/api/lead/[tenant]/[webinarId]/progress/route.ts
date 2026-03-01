import { NextRequest, NextResponse } from "next/server"
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

    const payload = (await request.json()) as {
      leadId?: string
      lessonId?: string
      watchedSeconds?: number
    }

    if (!payload.leadId || !payload.lessonId || typeof payload.watchedSeconds !== "number") {
      return NextResponse.json({ error: "Dados de progresso invalidos" }, { status: 400 })
    }

    const [lead, lesson] = await Promise.all([
      tenantContext.prisma.lead.findFirst({
        where: { id: payload.leadId, webinarId: params.webinarId },
        select: { id: true },
      }),
      tenantContext.prisma.lesson.findFirst({
        where: { id: payload.lessonId, webinarId: params.webinarId },
        select: { id: true, videoDuration: true },
      }),
    ])

    if (!lead || !lesson) {
      return NextResponse.json({ error: "Lead ou aula nao encontrados" }, { status: 404 })
    }

    const safeWatchedSeconds = Math.max(0, Math.floor(payload.watchedSeconds))
    const duration = lesson.videoDuration || 0
    const percentWatched = duration > 0 ? Math.min(100, (safeWatchedSeconds / duration) * 100) : 0
    const isCompleted = duration > 0 ? percentWatched >= 90 : false

    await tenantContext.prisma.leadProgress.upsert({
      where: {
        leadId_lessonId: {
          leadId: payload.leadId,
          lessonId: payload.lessonId,
        },
      },
      update: {
        watchedSeconds: safeWatchedSeconds,
        percentWatched,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastWatchedAt: new Date(),
      },
      create: {
        leadId: payload.leadId,
        lessonId: payload.lessonId,
        watchedSeconds: safeWatchedSeconds,
        percentWatched,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastWatchedAt: new Date(),
      },
    })

    await tenantContext.prisma.lead.update({
      where: { id: payload.leadId },
      data: {
        totalWatchTime: { increment: 5 },
        lastAccessAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Progress] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
