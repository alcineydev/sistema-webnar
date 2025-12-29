"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "@/lib/auth-helper"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function getLessonsByWebinarId(webinarId: string) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  return prisma.lesson.findMany({
    where: { webinarId },
    orderBy: { order: "asc" }
  })
}

export async function getLessonById(id: string) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  return prisma.lesson.findUnique({
    where: { id },
    include: { webinar: true }
  })
}

export async function createLesson(webinarId: string, formData: FormData) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  try {
    const title = formData.get("title") as string
    const slug = (formData.get("slug") as string) || generateSlug(title)
    const description = formData.get("description") as string || null
    const videoUrl = formData.get("videoUrl") as string
    const videoDuration = formData.get("videoDuration") ? parseInt(formData.get("videoDuration") as string) : null
    const thumbnailUrl = formData.get("thumbnailUrl") as string || null
    const isActive = formData.get("isActive") === "true"
    const releaseAt = formData.get("releaseAt") ? new Date(formData.get("releaseAt") as string) : null

    // Campos de oferta
    const offerUrlRaw = formData.get("offerUrl") as string
    const offerUrl = offerUrlRaw && offerUrlRaw.trim() !== "" ? offerUrlRaw.trim() : null
    const offerButtonTextRaw = formData.get("offerButtonText") as string
    const offerButtonText = offerButtonTextRaw && offerButtonTextRaw.trim() !== "" ? offerButtonTextRaw.trim() : null
    const offerShowAtRaw = formData.get("offerShowAt") as string
    const offerShowAt = offerShowAtRaw && offerShowAtRaw.trim() !== "" ? parseInt(offerShowAtRaw) : null

    // Pegar a ordem da última aula
    const lastLesson = await prisma.lesson.findFirst({
      where: { webinarId },
      orderBy: { order: "desc" }
    })
    const order = lastLesson ? lastLesson.order + 1 : 0

    console.log("[createLesson] Dados:", { title, offerUrl, offerButtonText, offerShowAt })

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
        releaseAt,
        offerUrl,
        offerButtonText,
        offerShowAt,
        webinarId
      }
    })

    revalidatePath(`/admin/webinars/${webinarId}/aulas`)
    return { success: true, lesson }
  } catch (error) {
    console.error("[createLesson] Error:", error)
    return { error: "Erro ao criar aula" }
  }
}

export async function updateLesson(lessonId: string, webinarId: string, formData: FormData) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  try {
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string || null
    const videoUrl = formData.get("videoUrl") as string
    const videoDuration = formData.get("videoDuration") ? parseInt(formData.get("videoDuration") as string) : null
    const thumbnailUrl = formData.get("thumbnailUrl") as string || null
    const isActive = formData.get("isActive") === "true"
    const releaseAt = formData.get("releaseAt") ? new Date(formData.get("releaseAt") as string) : null

    // Campos de oferta - tratar strings vazias como null
    const offerUrlRaw = formData.get("offerUrl") as string
    const offerUrl = offerUrlRaw && offerUrlRaw.trim() !== "" ? offerUrlRaw.trim() : null
    const offerButtonTextRaw = formData.get("offerButtonText") as string
    const offerButtonText = offerButtonTextRaw && offerButtonTextRaw.trim() !== "" ? offerButtonTextRaw.trim() : null
    const offerShowAtRaw = formData.get("offerShowAt") as string
    const offerShowAt = offerShowAtRaw && offerShowAtRaw.trim() !== "" ? parseInt(offerShowAtRaw) : null

    console.log("[updateLesson] Dados de oferta:", { offerUrl, offerButtonText, offerShowAt })

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
        releaseAt,
        offerUrl,
        offerButtonText,
        offerShowAt
      }
    })

    revalidatePath(`/admin/webinars/${webinarId}/aulas`)
    return { success: true, lesson }
  } catch (error) {
    console.error("[updateLesson] Error:", error)
    return { error: "Erro ao atualizar aula" }
  }
}

export async function deleteLesson(lessonId: string, webinarId: string) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  try {
    await prisma.lesson.delete({
      where: { id: lessonId }
    })

    revalidatePath(`/admin/webinars/${webinarId}/aulas`)
    return { success: true }
  } catch (error) {
    console.error("[deleteLesson] Error:", error)
    return { error: "Erro ao excluir aula" }
  }
}

export async function reorderLessons(webinarId: string, lessonIds: string[]) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await Promise.all(
    lessonIds.map((id, index) =>
      prisma.lesson.update({
        where: { id },
        data: { order: index }
      })
    )
  )

  revalidatePath(`/admin/webinars/${webinarId}/aulas`)
}
