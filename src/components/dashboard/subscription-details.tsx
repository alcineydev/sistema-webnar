"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatLimit } from "@/lib/plan-limits"

interface Plan {
  id: string
  name: string
  slug: string
  priceMonthly: number
  maxWebinars: number
  maxLeadsMonth: number
  isPopular: boolean
}

interface Payment {
  id: string
  amount: number
  status: string
  billingType: string
  createdAt: Date | string
  paymentDate: Date | string | null
}

interface Subscription {
  id: string
  status: string
  billingCycle: string
  currentPeriodEnd: Date | string | null
  plan: Plan
  payments: Payment[]
}

interface Props {
  subscription: Subscription
  plans: Plan[]
}

export function SubscriptionDetails({ subscription, plans }: Props) {
  const router = useRouter()
  const [upgradeModal, setUpgradeModal] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleUpgrade = async () => {
    if (!selectedPlan) return
    setLoading(true)

    try {
      const response = await fetch("/api/dashboard/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
      })

      if (response.ok) {
        router.refresh()
        setUpgradeModal(false)
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/dashboard/subscription/cancel", {
        method: "POST",
      })

      if (response.ok) {
        router.refresh()
        setCancelModal(false)
      }
    } catch (error) {
      console.error("Cancel error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900">Plano {subscription.plan.name}</h3>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="mt-1 text-slate-500">R$ {subscription.plan.priceMonthly.toFixed(2)}/mes</p>
            </div>
            <Button variant="outline" onClick={() => setUpgradeModal(true)}>
              Alterar Plano
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Webinars</p>
              <p className="text-lg font-semibold">{formatLimit(subscription.plan.maxWebinars)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Leads/mes</p>
              <p className="text-lg font-semibold">{formatLimit(subscription.plan.maxLeadsMonth)}</p>
            </div>
          </div>

          {subscription.currentPeriodEnd ? (
            <p className="mt-4 text-sm text-slate-500">
              Proxima cobranca em{" "}
              <span className="font-medium">
                {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM", {
                  locale: ptBR,
                })}
              </span>
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900">Historico de Pagamentos</h3>
          </div>
          {subscription.payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum pagamento registrado</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {subscription.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">R$ {payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(payment.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {subscription.status !== "cancelled" ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 font-semibold text-slate-900">Cancelar Assinatura</h3>
            <p className="mb-4 text-sm text-slate-500">
              Ao cancelar, voce perdera acesso aos recursos do plano atual.
            </p>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setCancelModal(true)}
            >
              Cancelar Assinatura
            </Button>
          </div>
        ) : null}
      </div>

      <Modal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        title="Alterar Plano"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            {plans
              .filter((plan) => plan.id !== subscription.plan.id)
              .map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    selectedPlan === plan.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{plan.name}</h4>
                      <p className="text-sm text-slate-500">
                        {formatLimit(plan.maxWebinars)} webinars · {formatLimit(plan.maxLeadsMonth)} leads/mes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {plan.priceMonthly.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">/mes</p>
                    </div>
                  </div>
                  {selectedPlan === plan.id ? (
                    <div className="mt-2 flex items-center text-sm text-indigo-600">
                      <Check className="mr-1 h-4 w-4" />
                      Selecionado
                    </div>
                  ) : null}
                </button>
              ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setUpgradeModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpgrade} disabled={!selectedPlan || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar Alteracao
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancelar Assinatura"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Atencao</p>
              <p className="text-sm text-amber-700">
                Ao cancelar, voce perdera acesso aos recursos do plano no fim do periodo atual.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelModal(false)}>
              Manter Plano
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCancel} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar Cancelamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
