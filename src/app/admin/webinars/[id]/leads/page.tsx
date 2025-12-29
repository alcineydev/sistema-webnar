import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Phone, Clock, Eye } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function WebinarLeadsPage({ params }: Props) {
  const { id } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    select: { id: true, name: true }
  })

  if (!webinar) {
    notFound()
  }

  const leads = await prisma.lead.findMany({
    where: { webinarId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      totalWatchTime: true,
      createdAt: true,
      progress: {
        select: {
          lessonId: true,
          percentWatched: true,
          isCompleted: true
        }
      }
    }
  })

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
    const mins = Math.floor(seconds / 60)
    return `${mins} min`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500">{webinar.name} • {leads.length} leads</p>
        </div>
        <Link href={`/admin/webinars/${id}/leads/novo`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Lead
          </Button>
        </Link>
      </div>

      {/* Tabela de leads */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Lead</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Progresso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tempo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Cadastro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const completedCount = lead.progress?.filter(p => p.isCompleted).length || 0
              const avgProgress = lead.progress && lead.progress.length > 0
                ? Math.round(lead.progress.reduce((acc, p) => acc + (p.percentWatched || 0), 0) / lead.progress.length)
                : 0

              return (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      <p className="text-sm text-slate-500">{lead.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${avgProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{avgProgress}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {completedCount} aula{completedCount !== 1 ? "s" : ""} concluída{completedCount !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(lead.totalWatchTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/webinars/${id}/leads/${lead.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nenhum lead cadastrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
