import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { lessonIds, webinarId } = await request.json()

    if (!lessonIds || !Array.isArray(lessonIds) || !webinarId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Atualizar ordem de cada aula
    const updates = lessonIds.map((lessonId: string, index: number) =>
      prisma.lesson.update({
        where: { id: lessonId },
        data: { order: index }
      })
    )

    await prisma.$transaction(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Reorder API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
