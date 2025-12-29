import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const userId = user.id

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
    console.error("[Dashboard API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
