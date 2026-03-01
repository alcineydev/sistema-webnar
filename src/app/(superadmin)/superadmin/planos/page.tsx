import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { prismaMaster } from "@/lib/db/master"
import { Button } from "@/components/ui/button"
import { PlansList } from "@/components/superadmin/plans-list"

export const metadata: Metadata = {
  title: "Planos | Super Admin",
}

export const dynamic = "force-dynamic"

async function getPlans() {
  return prismaMaster.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
  })
}

export default async function PlansPage() {
  const plans = await getPlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Planos</h1>
          <p className="text-slate-500">Gerencie os planos de assinatura</p>
        </div>
        <Link href="/superadmin/planos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </div>

      <PlansList plans={plans} />
    </div>
  )
}
