import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Users, Eye, MousePointer } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // Buscar métricas globais
  const [totalWebinars, totalLeads, totalEvents, recentLeads, webinars] = await Promise.all([
    prisma.webinar.count(),
    prisma.lead.count(),
    prisma.leadEvent.count(),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        webinar: { select: { name: true, id: true } }
      }
    }),
    prisma.webinar.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { leads: true, lessons: true } }
      }
    })
  ])

  // Calcular cliques em oferta
  const offerClicks = await prisma.leadProgress.count({
    where: { offerClicked: true }
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visão geral de todos os webinars</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Webinars
            </CardTitle>
            <Video className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWebinars}</div>
            <p className="text-xs text-slate-500">webinars criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-slate-500">em todos os webinars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Eventos
            </CardTitle>
            <Eye className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-slate-500">ações rastreadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Cliques Oferta
            </CardTitle>
            <MousePointer className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offerClicks}</div>
            <p className="text-xs text-slate-500">conversões potenciais</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Webinars recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-indigo-600" />
              Webinars Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webinars.map((webinar) => (
                <Link
                  key={webinar.id}
                  href={`/admin/webinars/${webinar.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">{webinar.name}</p>
                    <p className="text-sm text-slate-500">
                      {webinar._count.leads} leads • {webinar._count.lessons} aulas
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    webinar.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {webinar.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                  </span>
                </Link>
              ))}
              {webinars.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhum webinar criado</p>
              )}
            </div>
            <Link
              href="/admin/webinars"
              className="block text-center text-sm text-indigo-600 hover:text-indigo-800 mt-4"
            >
              Ver todos os webinars →
            </Link>
          </CardContent>
        </Card>

        {/* Leads recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Leads Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{lead.name}</p>
                    <p className="text-sm text-slate-500">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/admin/webinars/${lead.webinar.id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      {lead.webinar.name}
                    </Link>
                    <p className="text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhum lead cadastrado</p>
              )}
            </div>
            <Link
              href="/admin/leads"
              className="block text-center text-sm text-indigo-600 hover:text-indigo-800 mt-4"
            >
              Ver todos os leads →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
