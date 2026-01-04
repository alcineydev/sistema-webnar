import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug, lessonSlug } = await params
    console.log("[Lesson API] Request:", slug, lessonSlug)

    const webinar = await prisma.webinar.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        primaryColor: true,
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
          }
        }
      }
    })

    if (!webinar) {
      console.log("[Lesson API] Webinar not found")
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        webinarId: webinar.id,
        slug: lessonSlug,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        videoUrl: true,
        videoDuration: true,
        offerUrl: true,
        offerButtonText: true,
        offerShowAt: true,
        order: true,
        releaseAt: true
      }
    })

    if (!lesson) {
      console.log("[Lesson API] Lesson not found")
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }

    // Verificar se a aula está liberada
    if (lesson.releaseAt && new Date(lesson.releaseAt) > new Date()) {
      return NextResponse.json({ error: "Esta aula ainda não está disponível" }, { status: 403 })
    }

    console.log("[Lesson API] Found:", { id: lesson.id, title: lesson.title, offerUrl: lesson.offerUrl })

    const now = new Date()
    const allLessons = webinar.lessons.map(l => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      order: l.order,
      thumbnailUrl: l.thumbnailUrl,
      isLocked: l.releaseAt ? new Date(l.releaseAt) > now : false
    }))

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      videoDuration: lesson.videoDuration,
      // Oferta agora vem da AULA, não do webinar
      offerUrl: lesson.offerUrl,
      offerButtonText: lesson.offerButtonText || "Quero Aproveitar",
      offerShowAt: lesson.offerShowAt,
      webinar: {
        id: webinar.id,
        name: webinar.name,
        slug: webinar.slug,
        description: webinar.description,
        logoUrl: webinar.logoUrl,
        primaryColor: webinar.primaryColor
      },
      allLessons
    })
  } catch (error) {
    console.error("[Lesson API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
