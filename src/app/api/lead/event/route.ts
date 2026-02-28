import { NextRequest, NextResponse } from "next/server"
import { EventType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const ALLOWED_EVENT_TYPES = new Set<string>(Object.values(EventType))

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, lessonId, webinarId, videoTime, data } = body

    if (!eventType || !webinarId) {
      return NextResponse.json({ error: "eventType e webinarId sao obrigatorios" }, { status: 400 })
    }

    if (!ALLOWED_EVENT_TYPES.has(String(eventType))) {
      return NextResponse.json({ error: "eventType invalido" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const leadId = cookieStore.get(`lead_${webinarId}`)?.value

    if (!leadId) {
      return NextResponse.json({ error: "Lead nao identificado" }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, webinarId },
      select: { id: true },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead nao encontrado" }, { status: 404 })
    }

    if (lessonId) {
      const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, webinarId, isActive: true },
        select: { id: true },
      })

      if (!lesson) {
        return NextResponse.json({ error: "Aula invalida para este webinar" }, { status: 400 })
      }
    }

    const parsedVideoTime = Number(videoTime)
    const normalizedVideoTime = Number.isFinite(parsedVideoTime) ? Math.max(0, Math.floor(parsedVideoTime)) : null

    const event = await prisma.leadEvent.create({
      data: {
        leadId,
        lessonId: lessonId || null,
        eventType: eventType as EventType,
        videoTime: normalizedVideoTime,
        data: data || null,
        userAgent: request.headers.get("user-agent") || null,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      },
    })

    if (eventType === "OFFER_CLICKED" && lessonId) {
      await prisma.leadProgress.updateMany({
        where: { leadId, lessonId },
        data: {
          offerClicked: true,
          offerClickedAt: new Date(),
          offerClickCount: { increment: 1 },
        },
      })
    }

    if (eventType === "OFFER_SHOWN" && lessonId) {
      await prisma.leadProgress.updateMany({
        where: { leadId, lessonId },
        data: {
          offerShown: true,
          offerShownAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error("[Event API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
