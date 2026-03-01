import type { Metadata } from "next"
import { prismaMaster } from "@/lib/db/master"
import { PaymentsList } from "@/components/superadmin/payments-list"

export const metadata: Metadata = {
  title: "Pagamentos | Super Admin",
}

export const dynamic = "force-dynamic"

async function getPayments() {
  return prismaMaster.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      subscription: {
        include: {
          tenant: {
            select: { name: true, email: true },
          },
          plan: {
            select: { name: true },
          },
        },
      },
    },
  })
}

async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalRevenue, monthlyRevenue, pendingPayments, overduePayments] = await Promise.all([
    prismaMaster.payment.aggregate({
      where: { status: "confirmed" },
      _sum: { netAmount: true },
    }),
    prismaMaster.payment.aggregate({
      where: {
        status: "confirmed",
        paymentDate: { gte: startOfMonth },
      },
      _sum: { netAmount: true },
    }),
    prismaMaster.payment.count({
      where: { status: "pending" },
    }),
    prismaMaster.payment.count({
      where: { status: "overdue" },
    }),
  ])

  return {
    totalRevenue: totalRevenue._sum.netAmount || 0,
    monthlyRevenue: monthlyRevenue._sum.netAmount || 0,
    pendingPayments,
    overduePayments,
  }
}

export default async function PaymentsPage() {
  const [payments, stats] = await Promise.all([getPayments(), getStats()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pagamentos</h1>
        <p className="text-slate-500">Historico de pagamentos e cobrancas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Receita Total" value={`R$ ${stats.totalRevenue.toFixed(2)}`} color="green" />
        <StatCard
          title="Receita do Mes"
          value={`R$ ${stats.monthlyRevenue.toFixed(2)}`}
          color="indigo"
        />
        <StatCard title="Pendentes" value={stats.pendingPayments.toString()} color="amber" />
        <StatCard title="Inadimplentes" value={stats.overduePayments.toString()} color="red" />
      </div>

      <PaymentsList payments={payments} />
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: "green" | "indigo" | "amber" | "red"
}) {
  const colors = {
    green: "border-green-200 bg-green-50",
    indigo: "border-indigo-200 bg-indigo-50",
    amber: "border-amber-200 bg-amber-50",
    red: "border-red-200 bg-red-50",
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
