import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    return null
  }

  return createClient(supabaseUrl, serviceKey)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "thumbnails"

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      console.error("[Upload API] Missing Supabase env vars")
      return NextResponse.json({ error: "Upload indisponivel: configuracao ausente" }, { status: 500 })
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
