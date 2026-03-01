import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prismaMaster } from "@/lib/db/master"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { action } = (await request.json()) as { action?: string }

    let newStatus: string

    switch (action) {
      case "suspend":
        newStatus = "suspended"
        break
      case "activate":
        newStatus = "active"
        break
      case "cancel":
        newStatus = "cancelled"
        break
      default:
        return NextResponse.json({ error: "Acao invalida" }, { status: 400 })
    }

    await prismaMaster.tenant.update({
      where: { id: params.id },
      data: { status: newStatus },
    })

    if (action === "cancel") {
      await prismaMaster.subscription.updateMany({
        where: { tenantId: params.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      })
    } else if (action === "suspend") {
      await prismaMaster.subscription.updateMany({
        where: { tenantId: params.id },
        data: { status: "suspended" },
      })
    } else if (action === "activate") {
      await prismaMaster.subscription.updateMany({
        where: { tenantId: params.id },
        data: { status: "active" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Tenant Status] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
