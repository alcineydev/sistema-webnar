import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getToken } from "next-auth/jwt"

export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    })

    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "thumbnails"

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from("webinar-assets")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json({ error: "Erro no upload" }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from("webinar-assets")
      .getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
