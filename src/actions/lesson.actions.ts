"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { sanitizeRichTextHtml } from "@/lib/sanitize-html"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Nao autorizado")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user?.id) throw new Error("Nao autorizado")
  return user.id
}

async function assertWebinarOwnership(userId: string, webinarId: string) {
  const webinar = await prisma.webinar.findFirst({
    where: { id: webinarId, createdById: userId },
    select: { id: true },
  })

  if (!webinar) throw new Error("Webinar nao encontrado")
}

async function assertLessonOwnership(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      webinar: { createdById: userId },
    },
    select: { id: true, webinarId: true },
  })

  if (!lesson) throw new Error("Aula nao encontrada")
  return lesson
}

export async function getLessonsByWebinarId(webinarId: string) {
  const userId = await requireUserId()
  await assertWebinarOwnership(userId, webinarId)

  return prisma.lesson.findMany({
    where: { webinarId },
    orderBy: { order: "asc" },
  })
}

export async function getLessonById(id: string) {
  const userId = await requireUserId()

  return prisma.lesson.findFirst({
    where: { id, webinar: { createdById: userId } },
    include: { webinar: true },
  })
}

export async function createLesson(webinarId: string, formData: FormData) {
  const userId = await requireUserId()
  await assertWebinarOwnership(userId, webinarId)

  try {
    const title = formData.get("title") as string
    const slug = (formData.get("slug") as string) || generateSlug(title)
    const descriptionRaw = (formData.get("description") as string) || null
    const description = descriptionRaw ? sanitizeRichTextHtml(descriptionRaw) : null
    const videoUrl = formData.get("videoUrl") as string
    const videoDuration = formData.get("videoDuration") ? parseInt(formData.get("videoDuration") as string, 10) : null
    const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null
    const isActive = formData.get("isActive") === "true"
    const releaseType = (formData.get("releaseType") as string) || "immediate"
    const releaseAt = formData.get("releaseAt") ? new Date(formData.get("releaseAt") as string) : null
    const releaseAfterHoursRaw = formData.get("releaseAfterHours") as string
    const releaseAfterHours = releaseAfterHoursRaw && releaseAfterHoursRaw.trim() !== "" ? parseInt(releaseAfterHoursRaw, 10) : null

    const offerUrlRaw = formData.get("offerUrl") as string
    const offerUrl = offerUrlRaw && offerUrlRaw.trim() !== "" ? offerUrlRaw.trim() : null
    const offerButtonTextRaw = formData.get("offerButtonText") as string
    const offerButtonText = offerButtonTextRaw && offerButtonTextRaw.trim() !== "" ? offerButtonTextRaw.trim() : null
    const offerShowAtRaw = formData.get("offerShowAt") as string
    const offerShowAt = offerShowAtRaw && offerShowAtRaw.trim() !== "" ? parseInt(offerShowAtRaw, 10) : null

    const lastLesson = await prisma.lesson.findFirst({
      where: { webinarId },
      orderBy: { order: "desc" },
      select: { order: true },
    })
    const order = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        description,
        videoUrl,
        videoDuration,
        thumbnailUrl,
        order,
        isActive,
        releaseType,
        releaseAt,
        releaseAfterHours,
        offerUrl,
        offerButtonText,
        offerShowAt,
        webinarId,
      },
    })

    revalidatePath(`/admin/webinars/${webinarId}/aulas`)
    return { success: true, lesson }
  } catch (error) {
    console.error("[createLesson] Error:", error)
    return { error: "Erro ao criar aula" }
  }
}

export async function updateLesson(lessonId: string, webinarId: string, formData: FormData) {
  const userId = await requireUserId()
  await assertWebinarOwnership(userId, webinarId)
  const lessonOwned = await assertLessonOwnership(userId, lessonId)

  if (lessonOwned.webinarId !== webinarId) {
    return { error: "Aula nao pertence ao webinar informado" }
  }

  try {
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const descriptionRaw = (formData.get("description") as string) || null
    const description = descriptionRaw ? sanitizeRichTextHtml(descriptionRaw) : null
    const videoUrl = formData.get("videoUrl") as string
    const videoDuration = formData.get("videoDuration") ? parseInt(formData.get("videoDuration") as string, 10) : null
    const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null
    const isActive = formData.get("isActive") === "true"
    const releaseType = (formData.get("releaseType") as string) || "immediate"
    const releaseAt = formData.get("releaseAt") ? new Date(formData.get("releaseAt") as string) : null
    const releaseAfterHoursRaw = formData.get("releaseAfterHours") as string
    const releaseAfterHours = releaseAfterHoursRaw && releaseAfterHoursRaw.trim() !== "" ? parseInt(releaseAfterHoursRaw, 10) : null

    const offerUrlRaw = formData.get("offerUrl") as string
    const offerUrl = offerUrlRaw && offerUrlRaw.trim() !== "" ? offerUrlRaw.trim() : null
    const offerButtonTextRaw = formData.get("offerButtonText") as string
    const offerButtonText = offerButtonTextRaw && offerButtonTextRaw.trim() !== "" ? offerButtonTextRaw.trim() : null
    const offerShowAtRaw = formData.get("offerShowAt") as string
    const offerShowAt = offerShowAtRaw && offerShowAtRaw.trim() !== "" ? parseInt(offerShowAtRaw, 10) : null

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        slug,
        description,
        videoUrl,
        videoDuration,
        thumbnailUrl,
        isActive,
        releaseType,
        releaseAt,
        releaseAfterHours,
        offerUrl,
        offerButtonText,
        offerShowAt,
      },
    })

    revalidatePath(`/admin/webinars/${webinarId}/aulas`)
    return { success: true, lesson }
  } catch (error) {
    console.error("[updateLesson] Error:", error)
    return { error: "Erro ao atualizar aula" }
  }
}

export async function deleteLesson(lessonId: string, webinarId: string) {
  const userId = await requireUserId()
  await assertWebinarOwnership(userId, webinarId)
  const lessonOwned = await assertLessonOwnership(userId, lessonId)

  if (lessonOwned.webinarId !== webinarId) {
    return { error: "Aula nao pertence ao webinar informado" }
  }

  try {
    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    revalidatePath(`/admin/webinars/${webinarId}/aulas`)
    return { success: true }
  } catch (error) {
    console.error("[deleteLesson] Error:", error)
    return { error: "Erro ao excluir aula" }
  }
}

export async function reorderLessons(webinarId: string, lessonIds: string[]) {
  const userId = await requireUserId()
  await assertWebinarOwnership(userId, webinarId)

  const count = await prisma.lesson.count({
    where: {
      webinarId,
      id: { in: lessonIds },
    },
  })

  if (count !== lessonIds.length) {
    throw new Error("Lista de aulas invalida para este webinar")
  }

  await Promise.all(
    lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  revalidatePath(`/admin/webinars/${webinarId}/aulas`)
}
