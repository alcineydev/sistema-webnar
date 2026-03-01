import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prismaMaster } from "@/lib/db/master"
import { PlanForm } from "@/components/superadmin/plan-form"

export const metadata: Metadata = {
  title: "Editar Plano | Super Admin",
}

export const dynamic = "force-dynamic"

async function getPlan(id: string) {
  return prismaMaster.plan.findUnique({
    where: { id },
  })
}

export default async function EditPlanPage({
  params,
}: {
  params: { id: string }
}) {
  const plan = await getPlan(params.id)

  if (!plan) notFound()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Editar Plano</h1>
        <p className="text-slate-500">Atualize as configuracoes do plano</p>
      </div>

      <PlanForm plan={plan} />
    </div>
  )
}
