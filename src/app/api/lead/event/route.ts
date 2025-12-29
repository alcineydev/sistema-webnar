import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, lessonId, webinarId, videoTime, data } = body

    console.log("[Event API] Received:", { eventType, lessonId, webinarId, videoTime })

    if (!eventType || !webinarId) {
      return NextResponse.json({ error: "eventType e webinarId são obrigatórios" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const leadId = cookieStore.get(`lead_${webinarId}`)?.value

    if (!leadId) {
      return NextResponse.json({ error: "Lead não identificado" }, { status: 401 })
    }

    // Criar evento
    const event = await prisma.leadEvent.create({
      data: {
        leadId,
        lessonId: lessonId || null,
        eventType,
        videoTime: videoTime ? Math.floor(videoTime) : null,
        data: data || null,
        userAgent: request.headers.get("user-agent") || null,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || null
      }
    })

    // Se for clique na oferta, atualizar progresso
    if (eventType === "OFFER_CLICKED" && lessonId) {
      await prisma.leadProgress.updateMany({
        where: { leadId, lessonId },
        data: {
          offerClicked: true,
          offerClickedAt: new Date(),
          offerClickCount: { increment: 1 }
        }
      })
    }

    // Se for oferta mostrada, atualizar progresso
    if (eventType === "OFFER_SHOWN" && lessonId) {
      await prisma.leadProgress.updateMany({
        where: { leadId, lessonId },
        data: {
          offerShown: true,
          offerShownAt: new Date()
        }
      })
    }

    console.log("[Event API] Created:", event.id)

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error("[Event API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
