"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createWebinarSchema, updateWebinarSchema } from "@/lib/validations/webinar"

export async function getWebinars() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  return prisma.webinar.findMany({
    where: { createdById: session.user.id },
    include: {
      _count: {
        select: { lessons: true, leads: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function getWebinarById(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  return prisma.webinar.findFirst({
    where: { id, createdById: session.user.id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          videoUrl: true,
          videoDuration: true,
          thumbnailUrl: true,
          releaseAt: true,
          isActive: true,
          order: true,
        },
      },
      _count: { select: { leads: true } },
    },
  })
}

export async function createWebinar(data: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const formData = {
    name: data.get("name") as string,
    slug: data.get("slug") as string,
    description: data.get("description") as string || undefined,
    status: data.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    primaryColor: data.get("primaryColor") as string || "#6366f1",
    offerUrl: data.get("offerUrl") as string || undefined,
    offerButtonText: data.get("offerButtonText") as string || "Quero Aproveitar",
    urgencyMessage: data.get("urgencyMessage") as string || undefined,
  }

  const validated = createWebinarSchema.parse(formData)

  const existingSlug = await prisma.webinar.findUnique({
    where: { slug: validated.slug }
  })

  if (existingSlug) {
    throw new Error("Este slug já está em uso")
  }

  const webinar = await prisma.webinar.create({
    data: {
      ...validated,
      createdById: session.user.id,
    }
  })

  revalidatePath("/admin/webinars")
  redirect(`/admin/webinars/${webinar.id}`)
}

export async function updateWebinar(id: string, data: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const formData = {
    name: data.get("name") as string,
    slug: data.get("slug") as string,
    description: data.get("description") as string || undefined,
    status: data.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    primaryColor: data.get("primaryColor") as string || "#6366f1",
    offerUrl: data.get("offerUrl") as string || undefined,
    offerButtonText: data.get("offerButtonText") as string || "Quero Aproveitar",
    urgencyMessage: data.get("urgencyMessage") as string || undefined,
  }

  const validated = updateWebinarSchema.parse(formData)

  const existingSlug = await prisma.webinar.findFirst({
    where: { slug: validated.slug, id: { not: id } }
  })

  if (existingSlug) {
    throw new Error("Este slug já está em uso")
  }

  await prisma.webinar.update({
    where: { id, createdById: session.user.id },
    data: validated
  })

  revalidatePath("/admin/webinars")
  revalidatePath(`/admin/webinars/${id}`)
}

export async function deleteWebinar(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.webinar.delete({
    where: { id, createdById: session.user.id }
  })

  revalidatePath("/admin/webinars")
  redirect("/admin/webinars")
}

export async function toggleWebinarStatus(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.webinar.update({
    where: { id, createdById: session.user.id },
    data: { status }
  })

  revalidatePath("/admin/webinars")
  revalidatePath(`/admin/webinars/${id}`)
}
