import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, lessonSlug } = await params

    const webinar = await prisma.webinar.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
        webinarId: webinar.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        videoUrl: true,
        duration: true,
        order: true,
        offerTime: true,
        offerTitle: true,
        offerDescription: true,
        offerButtonText: true,
        offerButtonUrl: true,
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    // Get next and previous lessons
    const [prevLesson, nextLesson] = await Promise.all([
      prisma.lesson.findFirst({
        where: {
          webinarId: webinar.id,
          order: { lt: lesson.order },
        },
        orderBy: { order: "desc" },
        select: { slug: true, title: true },
      }),
      prisma.lesson.findFirst({
        where: {
          webinarId: webinar.id,
          order: { gt: lesson.order },
        },
        orderBy: { order: "asc" },
        select: { slug: true, title: true },
      }),
    ])

    return NextResponse.json({
      lesson,
      webinar,
      prevLesson,
      nextLesson,
    })
  } catch (error) {
    console.error("[Lesson API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
