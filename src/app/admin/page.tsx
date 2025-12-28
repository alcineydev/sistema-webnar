import Link from "next/link"
import { Plus, Video, Users, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const session = await auth()

  const [webinarCount, leadCount, todayLeads, webinars] = await Promise.all([
    prisma.webinar.count({ where: { createdById: session?.user?.id } }),
    prisma.lead.count({
      where: { webinar: { createdById: session?.user?.id } }
    }),
    prisma.lead.count({
      where: {
        webinar: { createdById: session?.user?.id },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.webinar.findMany({
      where: { createdById: session?.user?.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true, lessons: true } } }
    })
  ])

  const convertedLeads = await prisma.lead.count({
    where: {
      webinar: { createdById: session?.user?.id },
      status: "CONVERTED"
    }
  })

  const conversionRate = leadCount > 0
    ? (convertedLeads / leadCount * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Visão geral do seu sistema de webinars</p>
        </div>
        <Link href="/admin/webinars/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Webinar
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Webinars Ativos</CardTitle>
            <Video className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webinarCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inscrições Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webinars Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {webinars.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">Nenhum webinar criado ainda.</p>
              <Link href="/admin/webinars/new">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar seu primeiro webinar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {webinars.map((webinar) => (
                <Link
                  key={webinar.id}
                  href={`/admin/webinars/${webinar.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="font-medium">{webinar.name}</p>
                    <p className="text-sm text-slate-500">
                      {webinar._count.lessons} aulas • {webinar._count.leads} leads
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    webinar.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : webinar.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {webinar.status === "PUBLISHED" ? "Publicado" : webinar.status === "DRAFT" ? "Rascunho" : "Arquivado"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
