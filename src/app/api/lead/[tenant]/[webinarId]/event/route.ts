import { NextRequest, NextResponse } from "next/server"
import { resolveTenantBySlug } from "@/lib/db/resolve-tenant"
import type { Prisma } from ".prisma/tenant"

export const dynamic = "force-dynamic"

type TenantEventType =
  | "LEAD_REGISTERED"
  | "WEBINAR_ACCESSED"
  | "VIDEO_PLAY"
  | "VIDEO_PAUSE"
  | "VIDEO_SEEK"
  | "VIDEO_PROGRESS_25"
  | "VIDEO_PROGRESS_50"
  | "VIDEO_PROGRESS_75"
  | "VIDEO_COMPLETED"
  | "VIDEO_ABANDONED"
  | "OFFER_SHOWN"
  | "OFFER_CLICKED"

function mapEventType(type: string): TenantEventType {
  const key = type.toLowerCase()
  const mapping: Record<string, TenantEventType> = {
    registered: "LEAD_REGISTERED",
    webinar_accessed: "WEBINAR_ACCESSED",
    lesson_started: "VIDEO_PLAY",
    video_play: "VIDEO_PLAY",
    video_pause: "VIDEO_PAUSE",
    video_seek: "VIDEO_SEEK",
    video_progress_25: "VIDEO_PROGRESS_25",
    video_progress_50: "VIDEO_PROGRESS_50",
    video_progress_75: "VIDEO_PROGRESS_75",
    video_completed: "VIDEO_COMPLETED",
    video_abandoned: "VIDEO_ABANDONED",
    offer_shown: "OFFER_SHOWN",
    offer_clicked: "OFFER_CLICKED",
  }
  return mapping[key] || "VIDEO_PLAY"
}

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
      type?: string
      data?: Prisma.InputJsonValue
      videoTime?: number
    }

    if (!payload.leadId || !payload.type) {
      return NextResponse.json({ error: "leadId e type sao obrigatorios" }, { status: 400 })
    }

    const lead = await tenantContext.prisma.lead.findFirst({
      where: {
        id: payload.leadId,
        webinarId: params.webinarId,
      },
      select: { id: true },
    })
    if (!lead) {
      return NextResponse.json({ error: "Lead nao encontrado" }, { status: 404 })
    }

    const eventType = mapEventType(payload.type)
    await tenantContext.prisma.leadEvent.create({
      data: {
        leadId: payload.leadId,
        lessonId: payload.lessonId || null,
        eventType,
        data: payload.data || {},
        videoTime: payload.videoTime || null,
        userAgent: request.headers.get("user-agent"),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      },
    })

    if (eventType === "OFFER_CLICKED" && payload.lessonId) {
      await tenantContext.prisma.leadProgress.updateMany({
        where: {
          leadId: payload.leadId,
          lessonId: payload.lessonId,
        },
        data: {
          offerClicked: true,
          offerClickedAt: new Date(),
          offerClickCount: { increment: 1 },
        },
      })
    }

    if (eventType === "OFFER_SHOWN" && payload.lessonId) {
      await tenantContext.prisma.leadProgress.updateMany({
        where: {
          leadId: payload.leadId,
          lessonId: payload.lessonId,
        },
        data: {
          offerShown: true,
          offerShownAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Event] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
