import type { ElementType } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MousePointer, TrendingUp, Users, Video } from "lucide-react"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { prismaMaster } from "@/lib/db/master"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import {
  calculateUsagePercentage,
  formatLimit,
  getTenantPlanLimits,
  getTenantUsage,
} from "@/lib/plan-limits"

export const metadata: Metadata = {
  title: "Dashboard | Painel",
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const tenantContext = await resolveTenantByUserId(session.user.id)
  if (!tenantContext) redirect("/login")

  const { tenant, prisma: tenantPrisma } = tenantContext

  const [limits, usage, subscription, recentWebinars, totalLeads, totalOfferClicks] =
    await Promise.all([
      getTenantPlanLimits(tenant.id),
      getTenantUsage(tenant.id, tenantPrisma),
      prismaMaster.subscription.findUnique({
        where: { tenantId: tenant.id },
        include: { plan: true },
      }),
      tenantPrisma.webinar.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { leads: true, lessons: true },
          },
        },
      }),
      tenantPrisma.lead.count(),
      tenantPrisma.leadProgress.aggregate({
        _sum: { offerClickCount: true },
      }),
    ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Bem-vindo de volta, {session.user.name?.split(" ")[0]}
          </p>
        </div>
        <Link href="/painel/webinars/novo">
          <Button>Novo Webinar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Webinars"
          value={usage.webinars}
          subtitle={limits ? `de ${formatLimit(limits.maxWebinars)}` : ""}
          icon={Video}
          color="indigo"
          percentage={limits ? calculateUsagePercentage(usage.webinars, limits.maxWebinars) : 0}
        />
        <MetricCard
          title="Leads este mes"
          value={usage.leads}
          subtitle={limits ? `de ${formatLimit(limits.maxLeadsMonth)}` : ""}
          icon={Users}
          color="green"
          percentage={limits ? calculateUsagePercentage(usage.leads, limits.maxLeadsMonth) : 0}
        />
        <MetricCard title="Total de Leads" value={totalLeads} icon={TrendingUp} color="purple" />
        <MetricCard
          title="Cliques em Ofertas"
          value={totalOfferClicks._sum.offerClickCount || 0}
          icon={MousePointer}
          color="amber"
        />
      </div>

      {subscription && limits ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Plano {subscription.plan.name}</h3>
              <p className="text-sm text-slate-500">
                R$ {subscription.plan.priceMonthly.toFixed(2)}/mes
              </p>
            </div>
            <Link href="/painel/assinatura">
              <Button variant="outline" size="sm">
                Gerenciar
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <UsageBar label="Webinars" current={usage.webinars} limit={limits.maxWebinars} />
            <UsageBar label="Leads/mes" current={usage.leads} limit={limits.maxLeadsMonth} />
            <UsageBar label="Usuarios" current={usage.users} limit={limits.maxUsers} />
            <UsageBar
              label="Storage"
              current={usage.storage}
              limit={limits.maxStorageGB}
              unit="GB"
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Webinars Recentes</h3>
          <Link href="/painel/webinars" className="text-sm text-indigo-600 hover:underline">
            Ver todos
          </Link>
        </div>
        {recentWebinars.length === 0 ? (
          <div className="p-8 text-center">
            <Video className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="mb-4 text-slate-500">Voce ainda nao criou nenhum webinar</p>
            <Link href="/painel/webinars/novo">
              <Button>Criar primeiro webinar</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentWebinars.map((webinar) => (
              <Link
                key={webinar.id}
                href={`/painel/webinars/${webinar.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-100">
                    <Video className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{webinar.name}</p>
                    <p className="text-sm text-slate-500">
                      {webinar._count.lessons} aulas · {webinar._count.leads} leads
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    webinar.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {webinar.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                </span>
              </Link>
            ))}
          </div>
        )}
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
  percentage,
}: {
  title: string
  value: number
  subtitle?: string
  icon: ElementType
  color: "indigo" | "green" | "purple" | "amber"
  percentage?: number
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString("pt-BR")}</p>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      {percentage !== undefined && percentage > 0 ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${
              percentage >= 90
                ? "bg-red-500"
                : percentage >= 70
                  ? "bg-amber-500"
                  : "bg-indigo-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function UsageBar({
  label,
  current,
  limit,
  unit,
}: {
  label: string
  current: number
  limit: number
  unit?: string
}) {
  const percentage = limit === -1 ? 0 : Math.min(100, (current / limit) * 100)
  const isUnlimited = limit === -1

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">
          {current}
          {unit ? ` ${unit}` : ""} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: isUnlimited ? "0%" : `${percentage}%` }}
        />
      </div>
    </div>
  )
}
