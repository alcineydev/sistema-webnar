import type { Metadata } from "next"
import { PlanForm } from "@/components/superadmin/plan-form"

export const metadata: Metadata = {
  title: "Novo Plano | Super Admin",
}

export default function NewPlanPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Novo Plano</h1>
        <p className="text-slate-500">Crie um novo plano de assinatura</p>
      </div>

      <PlanForm />
    </div>
  )
}
