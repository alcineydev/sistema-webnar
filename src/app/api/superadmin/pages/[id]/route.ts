import { NextRequest, NextResponse } from "next/server"
import { prismaMaster } from "@/lib/db/master"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

function normalizeSlug(slug: string) {
  const trimmed = String(slug || "").trim()
  if (trimmed === "/" || trimmed === "") return "/"
  return trimmed.replace(/^\/+/, "").replace(/\/+$/, "")
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const page = await prismaMaster.page.findUnique({
      where: { id: params.id },
    })
    if (!page) {
      return NextResponse.json({ error: "Pagina nao encontrada" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("[Page GET] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const data = (await request.json()) as {
      title?: string
      slug?: string
      type?: string
      status?: string
      htmlContent?: string | null
      cssContent?: string | null
      jsContent?: string | null
      metaTitle?: string | null
      metaDescription?: string | null
    }

    const slug = normalizeSlug(data.slug || "")
    if (!data.title || !slug) {
      return NextResponse.json({ error: "Titulo e slug sao obrigatorios" }, { status: 400 })
    }

    const existing = await prismaMaster.page.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug ja existe" }, { status: 400 })
    }

    const page = await prismaMaster.page.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug,
        type: data.type || "normal",
        status: data.status || "draft",
        htmlContent: data.htmlContent || null,
        cssContent: data.cssContent || null,
        jsContent: data.jsContent || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("[Page PUT] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    await prismaMaster.page.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Page DELETE] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
