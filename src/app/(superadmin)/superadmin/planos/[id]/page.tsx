import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { prismaMaster } from "@/lib/db/master"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"

export const metadata: Metadata = {
  title: "Detalhes do Plano | Super Admin",
}

export const dynamic = "force-dynamic"

async function getPlan(id: string) {
  return prismaMaster.plan.findUnique({
    where: { id },
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
  })
}

function formatLimit(value: number) {
  return value === -1 ? "Ilimitado" : value.toString()
}

export default async function PlanDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const plan = await getPlan(params.id)

  if (!plan) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/superadmin/planos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{plan.name}</h1>
            <p className="text-slate-500">/{plan.slug}</p>
          </div>
        </div>
        <Link href={`/superadmin/planos/${plan.id}/editar`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Precos</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <InfoItem label="Mensal" value={`R$ ${plan.priceMonthly.toFixed(2)}`} />
              <InfoItem
                label="Trimestral"
                value={plan.priceQuarterly ? `R$ ${plan.priceQuarterly.toFixed(2)}` : "-"}
              />
              <InfoItem
                label="Anual"
                value={plan.priceYearly ? `R$ ${plan.priceYearly.toFixed(2)}` : "-"}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Limites</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <InfoItem label="Webinars" value={formatLimit(plan.maxWebinars)} />
              <InfoItem label="Aulas" value={formatLimit(plan.maxLessons)} />
              <InfoItem label="Leads/Mes" value={formatLimit(plan.maxLeadsMonth)} />
              <InfoItem label="Storage (GB)" value={formatLimit(plan.maxStorageGB)} />
              <InfoItem label="Usuarios" value={formatLimit(plan.maxUsers)} />
              <InfoItem label="Ordem" value={plan.sortOrder.toString()} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Recursos</h3>
            <div className="grid grid-cols-2 gap-3">
              <Feature label="Dominio Personalizado" enabled={plan.customDomain} />
              <Feature label="White-label" enabled={plan.whiteLabel} />
              <Feature label="Webhooks" enabled={plan.webhooks} />
              <Feature label="Pixels" enabled={plan.pixels} />
              <Feature label="Suporte Prioritario" enabled={plan.prioritySupport} />
              <Feature label="Popular" enabled={plan.isPopular} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Status</h3>
            <StatusBadge status={plan.isActive ? "active" : "suspended"} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Assinaturas</h3>
            <p className="text-2xl font-bold text-slate-900">{plan._count.subscriptions}</p>
            <p className="text-sm text-slate-500">Clientes neste plano</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  )
}

function Feature({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <StatusBadge status={enabled ? "active" : "suspended"} />
    </div>
  )
}
