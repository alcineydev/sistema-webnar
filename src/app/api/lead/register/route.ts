import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, webinarId, webinarSlug, utmSource, utmMedium, utmCampaign } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    if (!webinarId && !webinarSlug) {
      return NextResponse.json({ error: "webinarId ou webinarSlug é obrigatório" }, { status: 400 })
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

    // Verificar se já existe
    const existingLead = await prisma.lead.findUnique({
      where: {
        webinarId_email: {
          webinarId: webinar.id,
          email: email.toLowerCase().trim()
        }
      }
    })

    if (existingLead) {
      return NextResponse.json({
        error: "Este email já está cadastrado. Faça login.",
        alreadyExists: true
      }, { status: 409 })
    }

    // Criar lead
    const lead = await prisma.lead.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || email.split("@")[0],
        phone: phone?.replace(/\D/g, "") || null,
        accessToken: crypto.randomBytes(32).toString("hex"),
        webinarId: webinar.id,
        firstAccessAt: new Date(),
        lastAccessAt: new Date(),
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
        data: { source: "self-register", utmSource, utmMedium, utmCampaign }
      }
    })

    // Criar cookie
    const cookieStore = await cookies()
    cookieStore.set(`lead_${webinar.id}`, lead.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone
      }
    })
  } catch (error) {
    console.error("[Lead Register] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
