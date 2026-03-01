import type { Metadata } from "next"
import Link from "next/link"
import { prismaMaster } from "@/lib/db/master"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Criar Conta | Webinar Hub",
}

export const dynamic = "force-dynamic"

async function getPlans() {
  return prismaMaster.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceMonthly: true,
      priceYearly: true,
      maxWebinars: true,
      maxLeadsMonth: true,
      isPopular: true,
    },
  })
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { plan?: string }
}) {
  const plans = await getPlans()
  const selectedPlan =
    plans.find((p) => p.slug === searchParams?.plan)?.slug || plans[0]?.slug || ""

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Webinar Hub</h1>
          </Link>
          <p className="mt-2 text-slate-500">Crie sua conta e comece agora</p>
        </div>

        <RegisterForm plans={plans} selectedPlan={selectedPlan} />

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Ja tem conta?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
