import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import crypto from "crypto"

export const dynamic = "force-dynamic"

async function getCurrentUserId() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  return user?.id || null
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { email, name, phone, webinarId } = await request.json()

    if (!email || !name || !webinarId) {
      return NextResponse.json({ error: "Email, nome e webinarId sao obrigatorios" }, { status: 400 })
    }

    const webinar = await prisma.webinar.findFirst({
      where: { id: webinarId, createdById: userId },
      select: { id: true },
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const normalizedPhone = phone?.replace(/\D/g, "") || null

    const existing = await prisma.lead.findUnique({
      where: {
        webinarId_email: {
          webinarId,
          email: normalizedEmail,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Este email ja esta cadastrado neste webinar" }, { status: 409 })
    }

    const lead = await prisma.lead.create({
      data: {
        email: normalizedEmail,
        name: String(name).trim(),
        phone: normalizedPhone,
        accessToken: crypto.randomBytes(32).toString("hex"),
        webinarId,
      },
    })

    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        eventType: "LEAD_REGISTERED",
        data: { source: "admin-manual" },
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error("[Admin Leads API] Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
