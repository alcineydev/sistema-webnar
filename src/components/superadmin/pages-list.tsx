"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Eye,
  FileCheck,
  FileText,
  Home,
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

interface Page {
  id: string
  title: string
  slug: string
  type: string
  status: string
  updatedAt: Date
}

interface Props {
  pages: Page[]
}

const typeIcons: Record<string, React.ElementType> = {
  home: Home,
  normal: FileText,
  "404": AlertTriangle,
  terms: FileCheck,
  privacy: Shield,
}

const typeLabels: Record<string, string> = {
  home: "Home",
  normal: "Normal",
  "404": "Erro 404",
  terms: "Termos",
  privacy: "Privacidade",
}

function formatDateTime(value: Date) {
  const date = new Date(value)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toPublicPath(slug: string) {
  if (!slug || slug === "/") return "/"
  return slug.startsWith("/") ? slug : `/${slug}`
}

export function PagesList({ pages }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir esta pagina?")) return

    const response = await fetch(`/api/superadmin/pages/${id}`, { method: "DELETE" })
    if (response.ok) {
      router.refresh()
    }
  }

  const columns = [
    {
      key: "title",
      header: "Pagina",
      render: (page: Page) => {
        const Icon = typeIcons[page.type] || FileText
        return (
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Icon className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{page.title}</p>
              <p className="text-sm text-slate-500">{toPublicPath(page.slug)}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: "type",
      header: "Tipo",
      render: (page: Page) => (
        <span className="text-slate-600">{typeLabels[page.type] || page.type}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (page: Page) => <StatusBadge status={page.status} />,
    },
    {
      key: "updatedAt",
      header: "Atualizacao",
      render: (page: Page) => (
        <span className="text-sm text-slate-500">{formatDateTime(page.updatedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (page: Page) => (
        <div className="relative">
          <button
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen(menuOpen === page.id ? null : page.id)
            }}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen === page.id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <a
                  href={toPublicPath(page.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </a>
                <button
                  onClick={() => {
                    router.push(`/superadmin/paginas/${page.id}`)
                    setMenuOpen(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    void handleDelete(page.id)
                    setMenuOpen(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={pages}
      columns={columns}
      searchable
      searchKey="title"
      searchPlaceholder="Buscar pagina..."
      onRowClick={(page) => router.push(`/superadmin/paginas/${page.id}`)}
      emptyMessage="Nenhuma pagina cadastrada"
    />
  )
}
