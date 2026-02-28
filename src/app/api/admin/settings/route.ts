import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET - Buscar configuracoes
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const settings = await prisma.systemSettings.findMany()

    const settingsMap: Record<string, string | null> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value
    })

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("[Settings API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST - Salvar configuracao
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Key e obrigatoria" }, { status: 400 })
    }

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json({ success: true, setting })
  } catch (error) {
    console.error("[Settings API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
