"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

interface Plan {
  id: string
  name: string
  slug: string
  priceMonthly: number
  maxWebinars: number
  maxLeadsMonth: number
  isActive: boolean
  isPopular: boolean
  _count: {
    subscriptions: number
  }
}

interface Props {
  plans: Plan[]
}

export function PlansList({ plans }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const formatLimit = (value: number) => (value === -1 ? "Ilimitado" : value.toString())

  const columns = [
    {
      key: "name",
      header: "Plano",
      render: (plan: Plan) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-slate-900">{plan.name}</p>
            <p className="text-sm text-slate-500">/{plan.slug}</p>
          </div>
          {plan.isPopular ? (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
              Popular
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "priceMonthly",
      header: "Preco",
      render: (plan: Plan) => (
        <span className="font-medium">
          R$ {plan.priceMonthly.toFixed(2)}
          <span className="font-normal text-slate-500">/mes</span>
        </span>
      ),
    },
    {
      key: "limits",
      header: "Limites",
      render: (plan: Plan) => (
        <div className="text-sm">
          <p>{formatLimit(plan.maxWebinars)} webinars</p>
          <p className="text-slate-500">{formatLimit(plan.maxLeadsMonth)} leads/mes</p>
        </div>
      ),
    },
    {
      key: "subscriptions",
      header: "Assinantes",
      render: (plan: Plan) => <span className="text-slate-600">{plan._count.subscriptions}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (plan: Plan) => <StatusBadge status={plan.isActive ? "active" : "suspended"} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (plan: Plan) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(menuOpen === plan.id ? null : plan.id)
            }}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen === plan.id ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    router.push(`/superadmin/planos/${plan.id}`)
                    setMenuOpen(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </button>
                <button
                  onClick={() => {
                    router.push(`/superadmin/planos/${plan.id}/editar`)
                    setMenuOpen(null)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Deseja realmente excluir este plano?"
                    )
                    if (!confirmed) return

                    const response = await fetch(`/api/superadmin/plans/${plan.id}`, {
                      method: "DELETE",
                    })

                    if (!response.ok) {
                      const data = (await response.json()) as { error?: string }
                      window.alert(data.error || "Erro ao excluir plano")
                      return
                    }

                    setMenuOpen(null)
                    router.refresh()
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
      data={plans}
      columns={columns}
      onRowClick={(plan) => router.push(`/superadmin/planos/${plan.id}`)}
      emptyMessage="Nenhum plano cadastrado"
    />
  )
}
