import { prisma } from "@/lib/prisma"
import { Mail, Phone, Eye } from "lucide-react"
import Link from "next/link"

export default async function LeadsGlobalPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      webinar: {
        select: { id: true, name: true, slug: true }
      },
      _count: {
        select: { progress: true, events: true }
      }
    }
  })

  const totalLeads = await prisma.lead.count()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Todos os Leads</h1>
        <p className="text-slate-500">{totalLeads} leads cadastrados</p>
      </div>

      {/* Tabela de leads */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Lead</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Webinar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Progresso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Cadastro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{lead.name}</p>
                    <p className="text-sm text-slate-500">{lead.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/webinars/${lead.webinar.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {lead.webinar.name}
                  </Link>
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
                  <span className="text-sm text-slate-600">
                    {lead._count.progress} aulas • {lead._count.events} eventos
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/webinars/${lead.webinar.id}/leads/${lead.id}`}>
                    <button className="p-2 hover:bg-slate-100 rounded">
                      <Eye className="h-4 w-4 text-slate-400" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
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
