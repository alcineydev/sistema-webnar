import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params

    const webinar = await prisma.webinar.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        primaryColor: true,
        lessons: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          take: 1,
          select: { slug: true }
        }
      }
    })

    if (!webinar) {
      return NextResponse.json({ error: "Webinar não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: webinar.id,
      name: webinar.name,
      slug: webinar.slug,
      description: webinar.description,
      logoUrl: webinar.logoUrl,
      bannerUrl: webinar.bannerUrl,
      primaryColor: webinar.primaryColor,
      firstLessonSlug: webinar.lessons[0]?.slug || null
    })
  } catch (error) {
    console.error("[Webinar API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
