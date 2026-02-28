import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

function toSafeNumber(value: unknown, min: number, max: number) {
  const num = Number(value)
  if (!Number.isFinite(num)) return min
  return Math.min(max, Math.max(min, num))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, webinarId } = body

    if (!lessonId || !webinarId) {
      return NextResponse.json({ error: "lessonId e webinarId sao obrigatorios" }, { status: 400 })
    }

    const watchedSeconds = Math.floor(toSafeNumber(body.watchedSeconds, 0, 12 * 60 * 60))
    const percentWatched = Math.floor(toSafeNumber(body.percentWatched, 0, 100))

    const cookieStore = await cookies()
    const leadId = cookieStore.get(`lead_${webinarId}`)?.value

    if (!leadId) {
      return NextResponse.json({ error: "Lead nao identificado" }, { status: 401 })
    }

    const [lead, lesson] = await Promise.all([
      prisma.lead.findFirst({
        where: { id: leadId, webinarId },
        select: { id: true },
      }),
      prisma.lesson.findFirst({
        where: { id: lessonId, webinarId, isActive: true },
        select: { id: true },
      }),
    ])

    if (!lead) {
      return NextResponse.json({ error: "Lead nao encontrado" }, { status: 404 })
    }

    if (!lesson) {
      return NextResponse.json({ error: "Aula invalida para este webinar" }, { status: 400 })
    }

    const now = new Date()
    const isCompleted = percentWatched >= 90

    let progress = await prisma.leadProgress.findUnique({
      where: {
        leadId_lessonId: {
          leadId,
          lessonId,
        },
      },
    })

    let watchIncrement = 0

    if (!progress) {
      progress = await prisma.leadProgress.create({
        data: {
          leadId,
          lessonId,
          watchedSeconds,
          percentWatched,
          isCompleted,
          completedAt: isCompleted ? now : null,
          lastWatchedAt: now,
        },
      })
      watchIncrement = Math.min(watchedSeconds, 30)
    } else {
      const previousWatched = progress.watchedSeconds
      const newWatched = Math.max(previousWatched, watchedSeconds)
      const newPercent = Math.max(progress.percentWatched, percentWatched)
      const nowCompleted = newPercent >= 90

      progress = await prisma.leadProgress.update({
        where: { id: progress.id },
        data: {
          watchedSeconds: newWatched,
          percentWatched: newPercent,
          isCompleted: progress.isCompleted || nowCompleted,
          completedAt: !progress.isCompleted && nowCompleted ? now : progress.completedAt,
          lastWatchedAt: now,
        },
      })

      watchIncrement = Math.min(Math.max(0, newWatched - previousWatched), 30)
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        totalWatchTime: { increment: watchIncrement },
        lastAccessAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      progress: {
        watchedSeconds: progress.watchedSeconds,
        percentWatched: progress.percentWatched,
        isCompleted: progress.isCompleted,
      },
    })
  } catch (error) {
    console.error("[Progress API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
