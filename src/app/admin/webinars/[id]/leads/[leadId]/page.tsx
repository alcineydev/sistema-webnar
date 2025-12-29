import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Clock, Calendar, Play, CheckCircle, MousePointer } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string; leadId: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  const { id, leadId } = await params

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      webinar: {
        select: { id: true, name: true, slug: true }
      },
      progress: {
        include: {
          lesson: {
            select: { id: true, title: true, order: true }
          }
        },
        orderBy: { lesson: { order: "asc" } }
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 50
      }
    }
  })

  if (!lead || lead.webinar.id !== id) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date))
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "0 min"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}min`
    return `${mins} min`
  }

  const eventLabels: Record<string, string> = {
    LEAD_REGISTERED: "Cadastro realizado",
    WEBINAR_ACCESSED: "Acessou o webinar",
    VIDEO_PLAY: "Iniciou vídeo",
    VIDEO_PAUSE: "Pausou vídeo",
    VIDEO_PROGRESS_25: "Assistiu 25%",
    VIDEO_PROGRESS_50: "Assistiu 50%",
    VIDEO_PROGRESS_75: "Assistiu 75%",
    VIDEO_COMPLETED: "Completou vídeo",
    OFFER_SHOWN: "Oferta exibida",
    OFFER_CLICKED: "Clicou na oferta"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/webinars/${id}/leads`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
          <p className="text-slate-500">{lead.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info do Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Telefone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Cadastro</p>
                <p className="font-medium">{formatDate(lead.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Tempo total assistido</p>
                <p className="font-medium">{formatTime(lead.totalWatchTime)}</p>
              </div>
            </div>
            {lead.lastAccessAt && (
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Último acesso</p>
                  <p className="font-medium">{formatDate(lead.lastAccessAt)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progresso por aula */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Aula</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.progress.length > 0 ? (
              <div className="space-y-3">
                {lead.progress.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      p.isCompleted ? "bg-green-100" : "bg-slate-100"
                    }`}>
                      {p.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-slate-600">
                          {p.lesson.order + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.lesson.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 max-w-32 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${p.isCompleted ? "bg-green-600" : "bg-indigo-600"}`}
                            style={{ width: `${p.percentWatched}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{Math.round(p.percentWatched)}%</span>
                      </div>
                    </div>
                    {p.offerClicked && (
                      <MousePointer className="h-4 w-4 text-green-600" title="Clicou na oferta" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum progresso registrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Eventos recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.events.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {lead.events.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {eventLabels[event.eventType] || event.eventType}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum evento registrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
