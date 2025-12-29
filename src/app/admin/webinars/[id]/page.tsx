import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Play, Eye, MousePointer, Settings } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function WebinarDashboardPage({ params }: Props) {
  const { id } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          leads: true,
          lessons: true
        }
      },
      leads: {
        select: {
          id: true,
          totalWatchTime: true,
          progress: {
            select: {
              isCompleted: true,
              offerClicked: true
            }
          }
        }
      }
    }
  })

  if (!webinar) {
    notFound()
  }

  // Calcular métricas
  const totalLeads = webinar._count.leads
  const totalLessons = webinar._count.lessons

  const offerClicks = webinar.leads.reduce((acc, lead) => {
    return acc + lead.progress.filter(p => p.offerClicked).length
  }, 0)

  const avgWatchTime = totalLeads > 0
    ? Math.floor(webinar.leads.reduce((acc, lead) => acc + lead.totalWatchTime, 0) / totalLeads)
    : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{webinar.name}</h1>
        <p className="text-slate-500">Dashboard do Webinar</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Leads
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-slate-500">cadastrados neste webinar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Aulas
            </CardTitle>
            <Play className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-slate-500">aulas publicadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Tempo Médio
            </CardTitle>
            <Eye className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgWatchTime)}</div>
            <p className="text-xs text-slate-500">assistido por lead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Cliques na Oferta
            </CardTitle>
            <MousePointer className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offerClicks}</div>
            <p className="text-xs text-slate-500">leads clicaram</p>
          </CardContent>
        </Card>
      </div>

      {/* Acesso rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/admin/webinars/${id}/aulas`}>
          <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <Play className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold">Gerenciar Aulas</h3>
              <p className="text-sm text-slate-500">Adicionar, editar e organizar aulas</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/webinars/${id}/leads`}>
          <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold">Ver Leads</h3>
              <p className="text-sm text-slate-500">Lista de leads e progresso</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/webinars/${id}/configuracoes`}>
          <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <Settings className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold">Configurações</h3>
              <p className="text-sm text-slate-500">Ajustes do webinar</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
