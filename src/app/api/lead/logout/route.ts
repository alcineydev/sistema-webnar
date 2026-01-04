import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Listar todos os cookies e remover os que começam com lead_
    const allCookies = cookieStore.getAll()

    allCookies.forEach(cookie => {
      if (cookie.name.startsWith("lead_")) {
        cookieStore.delete(cookie.name)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Logout API] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
