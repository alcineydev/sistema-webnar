import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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

    const { lessonIds, webinarId } = await request.json()

    if (!Array.isArray(lessonIds) || lessonIds.length === 0 || !webinarId) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 })
    }

    const webinar = await prisma.webinar.findFirst({
      where: { id: webinarId, createdById: userId },
      select: { id: true },
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
    }

    const totalLessons = await prisma.lesson.count({
      where: {
        webinarId,
        id: { in: lessonIds },
      },
    })

    if (totalLessons !== lessonIds.length) {
      return NextResponse.json({ error: "Lista de aulas invalida para este webinar" }, { status: 400 })
    }

    await prisma.$transaction(
      lessonIds.map((lessonId: string, index: number) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Reorder API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
