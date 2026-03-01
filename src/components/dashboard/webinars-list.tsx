"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, MoreHorizontal, Pencil, Trash2, Video } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

interface Webinar {
  id: string
  name: string
  slug: string
  status: string
  createdAt: Date
  _count: {
    lessons: number
    leads: number
  }
}

interface Props {
  webinars: Webinar[]
  tenantSlug: string
}

export function WebinarsList({ webinars, tenantSlug }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este webinar?")) return
    const response = await fetch(`/api/dashboard/webinars/${id}`, { method: "DELETE" })
    if (response.ok) {
      router.refresh()
    }
  }

  const columns = [
    {
      key: "name",
      header: "Webinar",
      render: (webinar: Webinar) => (
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2">
            <Video className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{webinar.name}</p>
            <p className="text-sm text-slate-500">/{webinar.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "lessons",
      header: "Aulas",
      render: (webinar: Webinar) => <span className="text-slate-600">{webinar._count.lessons}</span>,
    },
    {
      key: "leads",
      header: "Leads",
      render: (webinar: Webinar) => <span className="text-slate-600">{webinar._count.leads}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (webinar: Webinar) => (
        <StatusBadge status={webinar.status === "PUBLISHED" ? "published" : "draft"} />
      ),
    },
    {
      key: "createdAt",
      header: "Criado",
      render: (webinar: Webinar) => (
        <span className="text-sm text-slate-500">
          {new Date(webinar.createdAt).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (webinar: Webinar) => (
        <div className="relative">
          <button
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen(menuOpen === webinar.id ? null : webinar.id)
            }}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen === webinar.id ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    router.push(`/painel/webinars/${webinar.id}`)
                    setMenuOpen(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <a
                  href={`/w/${tenantSlug}/${webinar.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visualizar
                </a>
                <button
                  onClick={() => {
                    void handleDelete(webinar.id)
                    setMenuOpen(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={webinars}
      columns={columns}
      searchable
      searchKey="name"
      searchPlaceholder="Buscar webinar..."
      onRowClick={(webinar) => router.push(`/painel/webinars/${webinar.id}`)}
      emptyMessage="Nenhum webinar criado ainda"
    />
  )
}
