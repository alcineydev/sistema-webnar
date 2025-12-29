import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

// POST - Atualizar progresso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, webinarId, watchedSeconds, percentWatched } = body

    console.log("[Progress API] Received:", { lessonId, webinarId, watchedSeconds, percentWatched })

    if (!lessonId || !webinarId) {
      console.log("[Progress API] Missing lessonId or webinarId")
      return NextResponse.json({ error: "lessonId e webinarId são obrigatórios" }, { status: 400 })
    }

    // Buscar lead pelo cookie
    const cookieStore = await cookies()
    const leadId = cookieStore.get(`lead_${webinarId}`)?.value

    console.log("[Progress API] LeadId from cookie:", leadId)

    if (!leadId) {
      console.log("[Progress API] No lead cookie found")
      return NextResponse.json({ error: "Lead não identificado" }, { status: 401 })
    }

    // Verificar se lead existe
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      console.log("[Progress API] Lead not found in database")
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
    }

    // Buscar ou criar progresso
    let progress = await prisma.leadProgress.findUnique({
      where: {
        leadId_lessonId: {
          leadId,
          lessonId
        }
      }
    })

    const isCompleted = (percentWatched || 0) >= 90
    const now = new Date()

    if (!progress) {
      console.log("[Progress API] Creating new progress")
      progress = await prisma.leadProgress.create({
        data: {
          leadId,
          lessonId,
          watchedSeconds: watchedSeconds || 0,
          percentWatched: percentWatched || 0,
          isCompleted,
          completedAt: isCompleted ? now : null,
          lastWatchedAt: now
        }
      })
    } else {
      // Atualiza se progresso for maior
      const newWatched = Math.max(progress.watchedSeconds, watchedSeconds || 0)
      const newPercent = Math.max(progress.percentWatched, percentWatched || 0)
      const nowCompleted = newPercent >= 90

      console.log("[Progress API] Updating progress:", { newWatched, newPercent, nowCompleted })

      progress = await prisma.leadProgress.update({
        where: { id: progress.id },
        data: {
          watchedSeconds: newWatched,
          percentWatched: newPercent,
          isCompleted: progress.isCompleted || nowCompleted,
          completedAt: (!progress.isCompleted && nowCompleted) ? now : progress.completedAt,
          lastWatchedAt: now
        }
      })
    }

    // Atualizar tempo total e último acesso do lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        totalWatchTime: { increment: 10 },
        lastAccessAt: now
      }
    })

    console.log("[Progress API] Success:", progress)

    return NextResponse.json({
      success: true,
      progress: {
        watchedSeconds: progress.watchedSeconds,
        percentWatched: progress.percentWatched,
        isCompleted: progress.isCompleted
      }
    })
  } catch (error) {
    console.error("[Progress API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
