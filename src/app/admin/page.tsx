import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Visão geral do seu sistema de webinars</p>
        </div>
        <Button asChild>
          <Link href="/admin/webinars/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Webinar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Leads</h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Webinars Ativos</h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Inscrições Hoje</h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Taxa de Conversão</h3>
          <p className="text-3xl font-bold text-slate-900">0%</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Webinars Recentes</h3>
        <div className="text-center py-8 text-slate-500">
          <p>Nenhum webinar criado ainda.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/admin/webinars/new">Criar seu primeiro webinar</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
