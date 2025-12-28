import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = token.id as string

    const [webinarCount, leadCount, todayLeads, webinars, convertedLeads] = await Promise.all([
      prisma.webinar.count({ where: { createdById: userId } }),
      prisma.lead.count({ where: { webinar: { createdById: userId } } }),
      prisma.lead.count({
        where: {
          webinar: { createdById: userId },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      prisma.webinar.findMany({
        where: { createdById: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { leads: true, lessons: true } } }
      }),
      prisma.lead.count({
        where: { webinar: { createdById: userId }, status: "CONVERTED" }
      })
    ])

    const conversionRate = leadCount > 0
      ? `${(convertedLeads / leadCount * 100).toFixed(1)}%`
      : "0%"

    return NextResponse.json({ webinarCount, leadCount, todayLeads, conversionRate, webinars })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
