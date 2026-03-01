"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  status: string
  createdAt: Date | string
  subscription: {
    plan: {
      name: string
    }
  } | null
  _count: {
    users: number
  }
}

interface Props {
  tenants: Tenant[]
}

export function TenantsList({ tenants }: Props) {
  const router = useRouter()

  const columns = [
    {
      key: "name",
      header: "Cliente",
      render: (tenant: Tenant) => (
        <div>
          <p className="font-medium text-slate-900">{tenant.name}</p>
          <p className="text-sm text-slate-500">{tenant.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      render: (tenant: Tenant) => (
        <span className="text-slate-600">{tenant.subscription?.plan.name || "Sem plano"}</span>
      ),
    },
    {
      key: "users",
      header: "Usuarios",
      render: (tenant: Tenant) => <span className="text-slate-600">{tenant._count.users}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (tenant: Tenant) => <StatusBadge status={tenant.status} />,
    },
    {
      key: "createdAt",
      header: "Cadastro",
      render: (tenant: Tenant) => (
        <span className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(tenant.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      data={tenants}
      columns={columns}
      searchable
      searchKey="name"
      searchPlaceholder="Buscar cliente..."
      onRowClick={(tenant) => router.push(`/superadmin/clientes/${tenant.id}`)}
      emptyMessage="Nenhum cliente cadastrado"
    />
  )
}
