import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, token, webinarId, webinarSlug } = await request.json()

    if (!email && !phone && !token) {
      return NextResponse.json({ error: "Informe email, telefone ou token" }, { status: 400 })
    }

    if (!webinarId && !webinarSlug) {
      return NextResponse.json({ error: "webinarId ou webinarSlug e obrigatorio" }, { status: 400 })
    }

    const webinar = webinarId
      ? await prisma.webinar.findUnique({ where: { id: webinarId } })
      : await prisma.webinar.findUnique({ where: { slug: webinarSlug } })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    let lead = null

    if (token) {
      lead = await prisma.lead.findUnique({
        where: { accessToken: token },
      })

      // Prevent token reuse across different webinars.
      if (lead && lead.webinarId !== webinar.id) {
        lead = null
      }
    }

    if (!lead && email) {
      lead = await prisma.lead.findUnique({
        where: {
          webinarId_email: {
            webinarId: webinar.id,
            email: String(email).toLowerCase().trim(),
          },
        },
      })
    }

    if (!lead && phone) {
      lead = await prisma.lead.findFirst({
        where: {
          webinarId: webinar.id,
          phone: String(phone).replace(/\D/g, ""),
        },
      })
    }

    if (!lead) {
      return NextResponse.json(
        {
          error: "Lead nao encontrado",
          notFound: true,
        },
        { status: 404 }
      )
    }

    const now = new Date()
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        firstAccessAt: lead.firstAccessAt || now,
        lastAccessAt: now,
      },
    })

    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        eventType: "WEBINAR_ACCESSED",
        data: { method: token ? "token" : email ? "email" : "phone" },
      },
    })

    const cookieStore = await cookies()
    cookieStore.set(`lead_${webinar.id}`, lead.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        phone: lead.phone,
        firstAccessAt: lead.firstAccessAt,
      },
    })
  } catch (error) {
    console.error("[Lead Auth] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
