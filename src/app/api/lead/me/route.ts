import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

interface ProgressRecord {
  lessonId: string
  percentWatched: number
  isCompleted: boolean
  completedAt: Date | null
}

interface ProgressMap {
  [key: string]: {
    percentWatched: number
    isCompleted: boolean
    completedAt: Date | null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const webinarId = searchParams.get("webinarId")
    const webinarSlug = searchParams.get("webinarSlug")

    if (!webinarId && !webinarSlug) {
      return NextResponse.json({ error: "webinarId ou webinarSlug é obrigatório" }, { status: 400 })
    }

    // Buscar webinar
    let webinar
    if (webinarId) {
      webinar = await prisma.webinar.findUnique({ where: { id: webinarId } })
    } else {
      webinar = await prisma.webinar.findUnique({ where: { slug: webinarSlug! } })
    }

    if (!webinar) {
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    // Buscar lead pelo cookie
    const cookieStore = await cookies()
    const leadId = cookieStore.get(`lead_${webinar.id}`)?.value

    if (!leadId) {
      return NextResponse.json({ lead: null })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        firstAccessAt: true,
        lastAccessAt: true,
        totalWatchTime: true
      }
    })

    if (!lead) {
      return NextResponse.json({ lead: null })
    }

    // Buscar progresso
    const progress = await prisma.leadProgress.findMany({
      where: { leadId: lead.id },
      select: {
        lessonId: true,
        percentWatched: true,
        isCompleted: true,
        completedAt: true
      }
    })

    return NextResponse.json({
      lead,
      progress: progress.reduce((acc: ProgressMap, p: ProgressRecord) => {
        acc[p.lessonId] = {
          percentWatched: p.percentWatched,
          isCompleted: p.isCompleted,
          completedAt: p.completedAt
        }
        return acc
      }, {} as ProgressMap)
    })
  } catch (error) {
    console.error("[Lead Me] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
