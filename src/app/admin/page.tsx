import Link from "next/link"
import { Plus, Video, Users, TrendingUp, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "@/lib/auth-helper"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    redirect("/admin/login")
  }

  const [webinarCount, leadCount, todayLeads, webinars] = await Promise.all([
    prisma.webinar.count({ where: { createdById: session.user.id } }),
    prisma.lead.count({
      where: { webinar: { createdById: session.user.id } }
    }),
    prisma.lead.count({
      where: {
        webinar: { createdById: session.user.id },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }),
    prisma.webinar.findMany({
      where: { createdById: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { leads: true, lessons: true } } }
    })
  ])

  const convertedLeads = await prisma.lead.count({
    where: {
      webinar: { createdById: session.user.id },
      status: "CONVERTED"
    }
  })

  const conversionRate = leadCount > 0
    ? (convertedLeads / leadCount * 100).toFixed(1)
    : "0"

  const stats = [
    {
      title: "Total de Leads",
      value: leadCount.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Webinars Ativos",
      value: webinarCount.toString(),
      change: "+2",
      trend: "up",
      icon: Video,
      color: "bg-indigo-500",
    },
    {
      title: "Conversão",
      value: `${conversionRate}%`,
      change: "+3.2%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Inscrições Hoje",
      value: todayLeads.toString(),
      change: todayLeads > 0 ? `+${todayLeads}` : "0",
      trend: todayLeads > 0 ? "up" : "neutral",
      icon: Eye,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Olá, {session.user.name || "Admin"} 👋
          </h2>
          <p className="text-slate-500">
            Aqui está o resumo do seu sistema de webinars
          </p>
        </div>
        <Link href="/admin/webinars/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Webinar
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg ${stat.color} p-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="mt-1 flex items-center text-sm">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                ) : stat.trend === "down" ? (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                ) : null}
                <span className={stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-slate-500"}>
                  {stat.change}
                </span>
                <span className="ml-1 text-slate-400">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Webinars */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Webinars Recentes</CardTitle>
          <Link href="/admin/webinars">
            <Button variant="ghost" size="sm">
              Ver todos
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {webinars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-slate-100 p-4">
                <Video className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mt-4 text-slate-500">Nenhum webinar criado ainda</p>
              <Link href="/admin/webinars/new" className="mt-4">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeiro webinar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {webinars.map((webinar) => (
                <Link
                  key={webinar.id}
                  href={`/admin/webinars/${webinar.id}`}
                  className="flex items-center justify-between py-4 hover:bg-slate-50 -mx-4 px-4 rounded-lg transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <Video className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{webinar.name}</p>
                      <p className="text-sm text-slate-500">
                        {webinar._count.lessons} aulas • {webinar._count.leads} leads
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
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
