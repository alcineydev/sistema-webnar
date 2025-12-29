import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação admin usando auth() do NextAuth v5
    const session = await auth()

    if (!session?.user?.email) {
      console.log("[Admin Leads API] No session found")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { email, name, phone, webinarId } = await request.json()

    if (!email || !name || !webinarId) {
      return NextResponse.json({ error: "Email, nome e webinarId são obrigatórios" }, { status: 400 })
    }

    // Verificar se webinar existe
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId }
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    // Verificar se já existe
    const existing = await prisma.lead.findUnique({
      where: {
        webinarId_email: {
          webinarId,
          email: email.toLowerCase().trim()
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado neste webinar" }, { status: 409 })
    }

    // Criar lead
    const lead = await prisma.lead.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        phone: phone?.replace(/\D/g, "") || null,
        accessToken: crypto.randomBytes(32).toString("hex"),
        webinarId
      }
    })

    // Registrar evento
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        eventType: "LEAD_REGISTERED",
        data: { source: "admin-manual" }
      }
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error("[Admin Leads API] Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
