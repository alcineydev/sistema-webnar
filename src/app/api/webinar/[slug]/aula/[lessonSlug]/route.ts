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
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        offerUrl: true,
        offerButtonText: true,
        lessons: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: { id: true, slug: true, title: true, order: true },
        },
      },
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        webinarId: webinar.id,
        slug: lessonSlug,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        videoUrl: true,
        videoDuration: true,
        offerShowAt: true,
        order: true,
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    const currentIndex = webinar.lessons.findIndex((l: { id: string }) => l.id === lesson.id)
    const prevLesson = currentIndex > 0 ? webinar.lessons[currentIndex - 1] : null
    const nextLesson =
      currentIndex < webinar.lessons.length - 1 ? webinar.lessons[currentIndex + 1] : null

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      videoDuration: lesson.videoDuration,
      offerShowAt: lesson.offerShowAt,
      webinar: {
        name: webinar.name,
        slug: webinar.slug,
        logoUrl: webinar.logoUrl,
        offerUrl: webinar.offerUrl,
        offerButtonText: webinar.offerButtonText,
      },
      prevLesson: prevLesson ? { slug: prevLesson.slug, title: prevLesson.title } : null,
      nextLesson: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null,
    })
  } catch (error) {
    console.error("Lesson API error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
