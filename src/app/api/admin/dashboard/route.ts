import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const [webinarCount, leadCount, todayLeads, webinars, convertedLeads] = await Promise.all([
      prisma.webinar.count({ where: { createdById: session.user.id } }),
      prisma.lead.count({ where: { webinar: { createdById: session.user.id } } }),
      prisma.lead.count({
        where: {
          webinar: { createdById: session.user.id },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.webinar.findMany({
        where: { createdById: session.user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { leads: true, lessons: true } } }
      }),
      prisma.lead.count({
        where: { webinar: { createdById: session.user.id }, status: "CONVERTED" }
      })
    ])

    const conversionRate = leadCount > 0
      ? `${(convertedLeads / leadCount * 100).toFixed(1)}%`
      : "0%"

    return NextResponse.json({
      webinarCount,
      leadCount,
      todayLeads,
      conversionRate,
      webinars
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
