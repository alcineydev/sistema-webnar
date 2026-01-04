import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET - Buscar configurações
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findMany()

    const settingsMap: Record<string, string | null> = {}
    settings.forEach(s => {
      settingsMap[s.key] = s.value
    })

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("[Settings API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST - Salvar configuração
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Key é obrigatória" }, { status: 400 })
    }

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json({ success: true, setting })
  } catch (error) {
    console.error("[Settings API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
