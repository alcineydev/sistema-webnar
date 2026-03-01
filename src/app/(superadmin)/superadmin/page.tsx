import type { ElementType } from "react"
import type { Metadata } from "next"
import { CreditCard, TrendingUp, Users, Wallet } from "lucide-react"
import { prismaMaster } from "@/lib/db/master"

export const metadata: Metadata = {
  title: "Dashboard | Super Admin",
}

export const dynamic = "force-dynamic"

async function getStats() {
  const [totalTenants, activeTenants, totalPlans, recentPayments] =
    await Promise.all([
      prismaMaster.tenant.count(),
      prismaMaster.tenant.count({ where: { status: "active" } }),
      prismaMaster.plan.count({ where: { isActive: true } }),
      prismaMaster.payment.count({ where: { status: "confirmed" } }),
    ])

  const subscriptions = await prismaMaster.subscription.findMany({
    where: { status: "active" },
    include: { plan: true },
  })

  const mrr = subscriptions.reduce((acc, sub) => acc + (sub.plan.priceMonthly || 0), 0)

  return {
    totalTenants,
    activeTenants,
    totalPlans,
    recentPayments,
    mrr,
  }
}

export default async function SuperAdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visao geral do Webinar Hub</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Clientes"
          value={stats.totalTenants}
          subtitle={`${stats.activeTenants} ativos`}
          icon={Users}
          color="indigo"
        />
        <MetricCard
          title="MRR"
          value={`R$ ${stats.mrr.toFixed(2)}`}
          subtitle="Receita mensal"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Planos Ativos"
          value={stats.totalPlans}
          subtitle="Disponiveis"
          icon={CreditCard}
          color="indigo"
        />
        <MetricCard
          title="Pagamentos"
          value={stats.recentPayments}
          subtitle="Confirmados"
          icon={Wallet}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Clientes por Plano</h3>
          <p className="text-sm text-slate-500">Grafico em desenvolvimento...</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Ultimos Cadastros</h3>
          <p className="text-sm text-slate-500">Lista em desenvolvimento...</p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: ElementType
  color: "indigo" | "green" | "amber"
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}
