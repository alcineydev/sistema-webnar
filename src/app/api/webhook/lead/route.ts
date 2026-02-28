import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    const expectedKey = process.env.WEBHOOK_API_KEY
    if (!expectedKey) {
      console.error("[Webhook Lead] WEBHOOK_API_KEY nao configurada")
      return NextResponse.json({ error: "Webhook indisponivel" }, { status: 500 })
    }

    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: "API key invalida" }, { status: 401 })
    }

    const body = await request.json()
    const {
      email,
      name,
      phone,
      webinarSlug,
      webinarId,
      utmSource,
      utmMedium,
      utmCampaign,
      activeCampaignId,
    } = body

    if (!email) {
      return NextResponse.json({ error: "Email e obrigatorio" }, { status: 400 })
    }

    if (!webinarSlug && !webinarId) {
      return NextResponse.json({ error: "webinarSlug ou webinarId e obrigatorio" }, { status: 400 })
    }

    const webinar = webinarId
      ? await prisma.webinar.findUnique({ where: { id: webinarId } })
      : await prisma.webinar.findUnique({ where: { slug: webinarSlug } })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()

    let lead = await prisma.lead.findUnique({
      where: {
        webinarId_email: {
          webinarId: webinar.id,
          email: normalizedEmail,
        },
      },
    })

    const accessToken = generateToken()

    if (lead) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: name || lead.name,
          phone: phone || lead.phone,
          accessToken,
          activeCampaignId: activeCampaignId || lead.activeCampaignId,
          utmSource: utmSource || lead.utmSource,
          utmMedium: utmMedium || lead.utmMedium,
          utmCampaign: utmCampaign || lead.utmCampaign,
        },
      })
    } else {
      lead = await prisma.lead.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
          phone: phone || null,
          accessToken,
          webinarId: webinar.id,
          activeCampaignId,
          utmSource,
          utmMedium,
          utmCampaign,
        },
      })

      await prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          eventType: "LEAD_REGISTERED",
          data: { source: "webhook", utmSource, utmMedium, utmCampaign },
        },
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sistema-webnar.vercel.app"
    const accessUrl = `${baseUrl}/w/${webinar.slug}?token=${accessToken}`

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
      },
      accessUrl,
      accessToken,
      webinar: {
        id: webinar.id,
        name: webinar.name,
        slug: webinar.slug,
      },
    })
  } catch (error) {
    console.error("[Webhook Lead] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
