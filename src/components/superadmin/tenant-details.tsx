"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CreditCard,
  Globe,
  Loader2,
  Pause,
  Play,
  User,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/status-badge"

interface Props {
  tenant: {
    id: string
    name: string
    slug: string
    email: string
    phone: string | null
    document: string | null
    status: string
    customDomain: string | null
    createdAt: Date | string
    users: {
      id: string
      name: string
      email: string
      role: string
      createdAt: Date | string
    }[]
    subscription: {
      id: string
      status: string
      billingCycle: string
      currentPeriodEnd: Date | string | null
      plan: {
        name: string
        priceMonthly: number
      }
      payments: {
        id: string
        amount: number
        status: string
        createdAt: Date | string
      }[]
    } | null
  }
}

export function TenantDetails({ tenant }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [actionModal, setActionModal] = useState<{
    type: "suspend" | "activate" | "cancel"
    open: boolean
  }>({ type: "suspend", open: false })

  const handleAction = async (action: "suspend" | "activate" | "cancel") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/superadmin/tenants/${tenant.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        window.alert(data.error || "Erro ao atualizar status")
        return
      }

      router.refresh()
      setActionModal((prev) => ({ ...prev, open: false }))
    } catch (error) {
      console.error("Tenant action error:", error)
    } finally {
      setLoading(false)
    }
  }

  const actionLabels = {
    suspend: { title: "Suspender Cliente", button: "Suspender", color: "bg-amber-600" },
    activate: { title: "Ativar Cliente", button: "Ativar", color: "bg-green-600" },
    cancel: { title: "Cancelar Cliente", button: "Cancelar", color: "bg-red-600" },
  }

  const actionVerb =
    actionModal.type === "suspend"
      ? "suspender"
      : actionModal.type === "activate"
        ? "ativar"
        : "cancelar"

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Informacoes</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoItem label="Slug" value={`/${tenant.slug}`} />
            <InfoItem label="Documento" value={tenant.document || "-"} />
            <InfoItem label="Telefone" value={tenant.phone || "-"} />
            <InfoItem
              label="Cadastro"
              value={format(new Date(tenant.createdAt), "dd/MM/yyyy 'as' HH:mm", {
                locale: ptBR,
              })}
            />
            {tenant.customDomain ? (
              <InfoItem
                label="Dominio"
                value={tenant.customDomain}
                icon={<Globe className="h-4 w-4 text-slate-400" />}
              />
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Usuarios ({tenant.users.length})</h3>
          <div className="space-y-3">
            {tenant.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <StatusBadge
                  status={user.role}
                  variant={user.role === "admin" ? "info" : "default"}
                />
              </div>
            ))}
          </div>
        </div>

        {tenant.subscription?.payments?.length ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Ultimos Pagamentos</h3>
            <div className="space-y-3">
              {tenant.subscription.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">R$ {payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(payment.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Status</h3>
            <StatusBadge status={tenant.status} />
          </div>

          <div className="space-y-2">
            {tenant.status === "active" ? (
              <Button
                variant="outline"
                className="w-full justify-start border-amber-200 text-amber-600 hover:bg-amber-50"
                onClick={() => setActionModal({ type: "suspend", open: true })}
              >
                <Pause className="mr-2 h-4 w-4" />
                Suspender
              </Button>
            ) : null}
            {tenant.status === "suspended" ? (
              <Button
                variant="outline"
                className="w-full justify-start border-green-200 text-green-600 hover:bg-green-50"
                onClick={() => setActionModal({ type: "activate", open: true })}
              >
                <Play className="mr-2 h-4 w-4" />
                Reativar
              </Button>
            ) : null}
            {tenant.status !== "cancelled" ? (
              <Button
                variant="outline"
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setActionModal({ type: "cancel", open: true })}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>

        {tenant.subscription ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Assinatura</h3>
            </div>
            <div className="space-y-3">
              <InfoItem label="Plano" value={tenant.subscription.plan.name} />
              <InfoItem
                label="Valor"
                value={`R$ ${tenant.subscription.plan.priceMonthly.toFixed(2)}/mes`}
              />
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <StatusBadge status={tenant.subscription.status} />
              </div>
              {tenant.subscription.currentPeriodEnd ? (
                <InfoItem
                  label="Proxima cobranca"
                  value={format(new Date(tenant.subscription.currentPeriodEnd), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal((prev) => ({ ...prev, open: false }))}
        title={actionLabels[actionModal.type].title}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Tem certeza que deseja {actionVerb} o cliente <strong>{tenant.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}
            >
              Fechar
            </Button>
            <Button
              className={actionLabels[actionModal.type].color}
              onClick={() => handleAction(actionModal.type)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {actionLabels[actionModal.type].button}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="flex items-center gap-2 font-medium text-slate-900">
        {icon}
        {value}
      </p>
    </div>
  )
}
