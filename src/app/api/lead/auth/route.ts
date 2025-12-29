import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

// POST - Login por email, telefone ou token
export async function POST(request: NextRequest) {
  try {
    const { email, phone, token, webinarId, webinarSlug } = await request.json()

    // Precisa de pelo menos um identificador
    if (!email && !phone && !token) {
      return NextResponse.json({ error: "Informe email, telefone ou token" }, { status: 400 })
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

    let lead = null

    // Buscar por token (prioridade)
    if (token) {
      lead = await prisma.lead.findUnique({
        where: { accessToken: token }
      })
    }

    // Buscar por email
    if (!lead && email) {
      lead = await prisma.lead.findUnique({
        where: {
          webinarId_email: {
            webinarId: webinar.id,
            email: email.toLowerCase().trim()
          }
        }
      })
    }

    // Buscar por telefone
    if (!lead && phone) {
      lead = await prisma.lead.findFirst({
        where: {
          webinarId: webinar.id,
          phone: phone.replace(/\D/g, "") // Remove não-dígitos
        }
      })
    }

    if (!lead) {
      return NextResponse.json({
        error: "Lead não encontrado",
        notFound: true
      }, { status: 404 })
    }

    // Atualizar primeiro acesso e último acesso
    const now = new Date()
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        firstAccessAt: lead.firstAccessAt || now,
        lastAccessAt: now
      }
    })

    // Registrar evento de acesso
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        eventType: "WEBINAR_ACCESSED",
        data: { method: token ? "token" : email ? "email" : "phone" }
      }
    })

    // Criar cookie de sessão
    const cookieStore = await cookies()
    cookieStore.set(`lead_${webinar.id}`, lead.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30 // 30 dias
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        firstAccessAt: lead.firstAccessAt
      }
    })
  } catch (error) {
    console.error("[Lead Auth] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
