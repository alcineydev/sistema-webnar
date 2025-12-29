import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// Gerar token único
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// POST - Receber lead do N8N
export async function POST(request: NextRequest) {
  try {
    // Verificar API Key (opcional, para segurança)
    const apiKey = request.headers.get("x-api-key")
    const expectedKey = process.env.WEBHOOK_API_KEY

    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: "API Key inválida" }, { status: 401 })
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
      activeCampaignId
    } = body

    // Validações
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    if (!webinarSlug && !webinarId) {
      return NextResponse.json({ error: "webinarSlug ou webinarId é obrigatório" }, { status: 400 })
    }

    // Buscar webinar
    let webinar
    if (webinarId) {
      webinar = await prisma.webinar.findUnique({ where: { id: webinarId } })
    } else {
      webinar = await prisma.webinar.findUnique({ where: { slug: webinarSlug } })
    }

    if (!webinar) {
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    // Verificar se lead já existe
    let lead = await prisma.lead.findUnique({
      where: {
        webinarId_email: {
          webinarId: webinar.id,
          email: email.toLowerCase().trim()
        }
      }
    })

    const accessToken = generateToken()

    if (lead) {
      // Atualizar lead existente
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: name || lead.name,
          phone: phone || lead.phone,
          accessToken,
          activeCampaignId: activeCampaignId || lead.activeCampaignId,
          utmSource: utmSource || lead.utmSource,
          utmMedium: utmMedium || lead.utmMedium,
          utmCampaign: utmCampaign || lead.utmCampaign
        }
      })
    } else {
      // Criar novo lead
      lead = await prisma.lead.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name || email.split("@")[0],
          phone: phone || null,
          accessToken,
          webinarId: webinar.id,
          activeCampaignId,
          utmSource,
          utmMedium,
          utmCampaign
        }
      })

      // Registrar evento
      await prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          eventType: "LEAD_REGISTERED",
          data: { source: "webhook", utmSource, utmMedium, utmCampaign }
        }
      })
    }

    // Gerar URL de acesso
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sistema-webnar.vercel.app"
    const accessUrl = `${baseUrl}/w/${webinar.slug}?token=${accessToken}`

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone
      },
      accessUrl,
      accessToken,
      webinar: {
        id: webinar.id,
        name: webinar.name,
        slug: webinar.slug
      }
    })
  } catch (error) {
    console.error("[Webhook Lead] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
