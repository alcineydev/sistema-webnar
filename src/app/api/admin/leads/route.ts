import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    })

    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { email, name, phone, webinarId } = await request.json()

    if (!email || !name || !webinarId) {
      return NextResponse.json({ error: "Email, nome e webinarId são obrigatórios" }, { status: 400 })
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
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
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
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
