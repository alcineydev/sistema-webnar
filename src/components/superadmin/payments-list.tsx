"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

interface Payment {
  id: string
  amount: number
  netAmount: number | null
  status: string
  billingType: string
  source: string | null
  createdAt: Date | string
  paymentDate: Date | string | null
  subscription: {
    tenant: {
      name: string
      email: string
    }
    plan: {
      name: string
    }
  }
}

interface Props {
  payments: Payment[]
}

export function PaymentsList({ payments }: Props) {
  const columns = [
    {
      key: "tenant",
      header: "Cliente",
      render: (payment: Payment) => (
        <div>
          <p className="font-medium text-slate-900">{payment.subscription.tenant.name}</p>
          <p className="text-sm text-slate-500">{payment.subscription.tenant.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      render: (payment: Payment) => (
        <span className="text-slate-600">{payment.subscription.plan.name}</span>
      ),
    },
    {
      key: "amount",
      header: "Valor",
      render: (payment: Payment) => (
        <div>
          <p className="font-medium">R$ {payment.amount.toFixed(2)}</p>
          {payment.netAmount && payment.netAmount !== payment.amount ? (
            <p className="text-xs text-slate-500">Liquido: R$ {payment.netAmount.toFixed(2)}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "billingType",
      header: "Tipo",
      render: (payment: Payment) => {
        const types: Record<string, string> = {
          BOLETO: "Boleto",
          CREDIT_CARD: "Cartao",
          PIX: "PIX",
          EXTERNAL: "Externo",
        }
        return <span className="text-slate-600">{types[payment.billingType] || payment.billingType}</span>
      },
    },
    {
      key: "source",
      header: "Origem",
      render: (payment: Payment) => (
        <span className="capitalize text-sm text-slate-500">{payment.source || "asaas"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (payment: Payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: "date",
      header: "Data",
      render: (payment: Payment) => (
        <div className="text-sm">
          <p className="text-slate-900">
            {format(new Date(payment.createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </p>
          {payment.paymentDate ? (
            <p className="text-slate-500">
              Pago em {format(new Date(payment.paymentDate), "dd/MM", { locale: ptBR })}
            </p>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={payments}
      columns={columns}
      searchable
      searchKey="subscription"
      searchPlaceholder="Buscar pagamento..."
      emptyMessage="Nenhum pagamento encontrado"
    />
  )
}
