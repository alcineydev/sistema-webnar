import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { prismaMaster } from "@/lib/db/master"
import { asaas } from "@/lib/payment/asaas"
import { createSubscription } from "@/lib/payment/subscription-service"
import { provisionTenantSchema } from "@/lib/db/provision-tenant"

export const dynamic = "force-dynamic"

function generateSlug(companyName: string) {
  return companyName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as {
      email?: string
      password?: string
      name?: string
      companyName?: string
      planSlug?: string
      billingCycle?: "monthly" | "quarterly" | "yearly"
      phone?: string
      document?: string
    }

    if (!data.email || !data.password || !data.name || !data.companyName || !data.planSlug) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    if (data.password.length < 8) {
      return NextResponse.json({ error: "Senha deve ter ao menos 8 caracteres" }, { status: 400 })
    }

    const existingUser = await prismaMaster.user.findUnique({
      where: { email: data.email },
    })
    if (existingUser) {
      return NextResponse.json({ error: "Email ja cadastrado" }, { status: 400 })
    }

    const plan = await prismaMaster.plan.findUnique({
      where: { slug: data.planSlug },
    })
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plano nao encontrado" }, { status: 400 })
    }

    const baseSlug = generateSlug(data.companyName)
    if (!baseSlug) {
      return NextResponse.json({ error: "Nome de empresa invalido" }, { status: 400 })
    }

    let slug = baseSlug
    let slugCounter = 0
    while (await prismaMaster.tenant.findUnique({ where: { slug } })) {
      slugCounter++
      slug = `${baseSlug}-${slugCounter}`
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const tenant = await prismaMaster.tenant.create({
      data: {
        name: data.companyName,
        slug,
        email: data.email,
        phone: data.phone || null,
        document: data.document || null,
        status: "pending",
      },
    })

    const provisionResult = await provisionTenantSchema(tenant.id, tenant.slug)
    if (!provisionResult.success) {
      await prismaMaster.tenant.delete({ where: { id: tenant.id } }).catch(() => null)
      return NextResponse.json(
        { error: "Erro ao configurar conta. Tente novamente." },
        { status: 500 }
      )
    }

    await prismaMaster.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: "admin",
        tenantId: tenant.id,
      },
    })

    try {
      const { asaasSubscription } = await createSubscription({
        tenantId: tenant.id,
        planId: plan.id,
        billingCycle: data.billingCycle || "monthly",
        customerData: {
          name: data.name,
          email: data.email,
          cpfCnpj: data.document,
          phone: data.phone,
        },
      })

      let paymentUrl: string | null = null
      if (asaasSubscription.id) {
        const payments = await asaas.getSubscriptionPayments(asaasSubscription.id)
        const firstPayment = payments.data[0]
        paymentUrl =
          firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || firstPayment?.pixQrCodeUrl || null
      }

      return NextResponse.json({
        success: true,
        tenant: { id: tenant.id, slug: tenant.slug },
        paymentUrl,
      })
    } catch (paymentError) {
      console.error("[Register] Erro no pagamento:", paymentError)

      await prismaMaster.tenant.update({
        where: { id: tenant.id },
        data: { status: "active" },
      })

      return NextResponse.json({
        success: true,
        tenant: { id: tenant.id, slug: tenant.slug },
        paymentUrl: null,
        message: "Conta criada. Configure o pagamento depois.",
      })
    }
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}
