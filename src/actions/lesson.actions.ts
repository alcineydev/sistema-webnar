"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { createLessonSchema, updateLessonSchema } from "@/lib/validations/webinar"

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

export async function createLesson(webinarId: string, data: FormData) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const webinar = await prisma.webinar.findFirst({
    where: { id: webinarId, createdById: session.user.id }
  })

  if (!webinar) throw new Error("Webinar não encontrado")

  const lastLesson = await prisma.lesson.findFirst({
    where: { webinarId },
    orderBy: { order: "desc" }
  })

  const formData = {
    title: data.get("title") as string,
    slug: data.get("slug") as string,
    description: data.get("description") as string || undefined,
    videoUrl: data.get("videoUrl") as string,
    thumbnailUrl: data.get("thumbnailUrl") as string || undefined,
    order: lastLesson ? lastLesson.order + 1 : 0,
    isActive: data.get("isActive") === "true",
    releaseAt: data.get("releaseAt") ? new Date(data.get("releaseAt") as string) : null,
    offerShowAt: data.get("offerShowAt") ? parseInt(data.get("offerShowAt") as string) : null,
  }

  const validated = createLessonSchema.parse(formData)

  const existingSlug = await prisma.lesson.findFirst({
    where: { webinarId, slug: validated.slug }
  })

  if (existingSlug) {
    throw new Error("Este slug já está em uso neste webinar")
  }

  await prisma.lesson.create({
    data: {
      ...validated,
      webinarId
    }
  })

  revalidatePath(`/admin/webinars/${webinarId}`)
}

export async function updateLesson(id: string, webinarId: string, data: FormData) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const formData = {
    title: data.get("title") as string,
    slug: data.get("slug") as string,
    description: data.get("description") as string || undefined,
    videoUrl: data.get("videoUrl") as string,
    thumbnailUrl: data.get("thumbnailUrl") as string || undefined,
    isActive: data.get("isActive") === "true",
    releaseAt: data.get("releaseAt") ? new Date(data.get("releaseAt") as string) : null,
    offerShowAt: data.get("offerShowAt") ? parseInt(data.get("offerShowAt") as string) : null,
  }

  const validated = updateLessonSchema.parse(formData)

  const existingSlug = await prisma.lesson.findFirst({
    where: { webinarId, slug: validated.slug, id: { not: id } }
  })

  if (existingSlug) {
    throw new Error("Este slug já está em uso neste webinar")
  }

  await prisma.lesson.update({
    where: { id },
    data: validated
  })

  revalidatePath(`/admin/webinars/${webinarId}`)
}

export async function deleteLesson(id: string, webinarId: string) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.lesson.delete({ where: { id } })

  revalidatePath(`/admin/webinars/${webinarId}`)
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

  revalidatePath(`/admin/webinars/${webinarId}`)
}
