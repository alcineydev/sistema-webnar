import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, lessonSlug } = await params
    console.log("[Lesson API] Buscando aula:", { slug, lessonSlug })

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
          select: {
            id: true,
            slug: true,
            title: true,
            order: true,
            thumbnailUrl: true,
            releaseAt: true,
          },
        },
      },
    })

    if (!webinar) {
      console.log("[Lesson API] Webinar não encontrado:", slug)
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    console.log("[Lesson API] Webinar encontrado:", { id: webinar.id, name: webinar.name, totalLessons: webinar.lessons.length })

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
      console.log("[Lesson API] Aula não encontrada:", lessonSlug)
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    console.log("[Lesson API] Aula encontrada:", {
      id: lesson.id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      videoDuration: lesson.videoDuration
    })

    // Verificar se a aula está bloqueada por data de liberação
    const lessonInfo = webinar.lessons.find((l: { id: string }) => l.id === lesson.id)
    if (lessonInfo?.releaseAt && new Date(lessonInfo.releaseAt) > new Date()) {
      console.log("[Lesson API] Aula bloqueada por data:", { releaseAt: lessonInfo.releaseAt })
      return NextResponse.json({ error: "Esta aula ainda não está disponível" }, { status: 403 })
    }

    const currentIndex = webinar.lessons.findIndex((l: { id: string }) => l.id === lesson.id)
    const now = new Date()

    const allLessons = webinar.lessons.map((l: { id: string; title: string; slug: string; order: number; thumbnailUrl: string | null; releaseAt: Date | null }) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      order: l.order,
      thumbnailUrl: l.thumbnailUrl,
      isLocked: l.releaseAt ? new Date(l.releaseAt) > now : false,
    }))

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
      allLessons,
      currentIndex,
    })
  } catch (error) {
    console.error("Lesson API error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
