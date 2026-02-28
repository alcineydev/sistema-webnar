import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { sanitizeRichTextHtml } from "@/lib/sanitize-html"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{ slug: string; lessonSlug: string }>
}

type LessonRelease = {
  id: string
  slug: string
  title: string
  order: number
  thumbnailUrl?: string | null
  releaseType: string
  releaseAt: Date | null
  releaseAfterHours: number | null
}

type ProgressMap = Map<string, { isCompleted: boolean; completedAt: Date | null }>

function isLessonLocked(
  lesson: LessonRelease,
  allLessons: LessonRelease[],
  progressMap: ProgressMap,
  hasLead: boolean,
  now: Date
) {
  const releaseType = lesson.releaseType || "immediate"

  if (releaseType === "scheduled") {
    return lesson.releaseAt ? new Date(lesson.releaseAt) > now : false
  }

  if (releaseType === "sequential") {
    const previous = allLessons
      .filter((candidate) => candidate.order < lesson.order)
      .sort((a, b) => b.order - a.order)[0]

    if (!previous) return false
    if (!hasLead) return true

    const previousProgress = progressMap.get(previous.id)
    if (!previousProgress?.isCompleted || !previousProgress.completedAt) {
      return true
    }

    const delayHours = lesson.releaseAfterHours || 0
    const unlockAt = new Date(previousProgress.completedAt.getTime() + delayHours * 60 * 60 * 1000)
    return unlockAt > now
  }

  return false
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, lessonSlug } = await params

    const webinar = await prisma.webinar.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        logoLightUrl: true,
        logoDarkUrl: true,
        faviconUrl: true,
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
            releaseType: true,
            releaseAt: true,
            releaseAfterHours: true,
          },
        },
      },
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar nao encontrado" }, { status: 404 })
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
        offerUrl: true,
        offerButtonText: true,
        offerShowAt: true,
        order: true,
        releaseType: true,
        releaseAt: true,
        releaseAfterHours: true,
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Aula nao encontrada" }, { status: 404 })
    }

    const cookieStore = await cookies()
    const leadId = cookieStore.get(`lead_${webinar.id}`)?.value || null

    let hasLead = false
    let progressMap: ProgressMap = new Map()

    if (leadId) {
      const lead = await prisma.lead.findFirst({
        where: { id: leadId, webinarId: webinar.id },
        select: { id: true },
      })

      if (lead) {
        hasLead = true
        const progressRows = await prisma.leadProgress.findMany({
          where: {
            leadId: lead.id,
            lessonId: { in: webinar.lessons.map((item) => item.id) },
          },
          select: {
            lessonId: true,
            isCompleted: true,
            completedAt: true,
          },
        })

        progressMap = new Map(
          progressRows.map((progress) => [
            progress.lessonId,
            {
              isCompleted: progress.isCompleted,
              completedAt: progress.completedAt,
            },
          ])
        )
      }
    }

    const now = new Date()
    const lessonLocked = isLessonLocked(lesson, webinar.lessons, progressMap, hasLead, now)
    if (lessonLocked) {
      return NextResponse.json({ error: "Esta aula ainda nao esta disponivel" }, { status: 403 })
    }

    const allLessons = webinar.lessons.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      order: item.order,
      thumbnailUrl: item.thumbnailUrl,
      isLocked: isLessonLocked(item, webinar.lessons, progressMap, hasLead, now),
    }))

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ? sanitizeRichTextHtml(lesson.description) : null,
      videoUrl: lesson.videoUrl,
      videoDuration: lesson.videoDuration,
      offerUrl: lesson.offerUrl,
      offerButtonText: lesson.offerButtonText || "Quero Aproveitar",
      offerShowAt: lesson.offerShowAt,
      webinar: {
        id: webinar.id,
        name: webinar.name,
        slug: webinar.slug,
        description: webinar.description,
        logoUrl: webinar.logoUrl,
        logoLightUrl: webinar.logoLightUrl,
        logoDarkUrl: webinar.logoDarkUrl,
        faviconUrl: webinar.faviconUrl,
        primaryColor: webinar.primaryColor,
      },
      allLessons,
    })
  } catch (error) {
    console.error("[Lesson API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
