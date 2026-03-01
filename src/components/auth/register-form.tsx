"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  maxWebinars: number
  maxLeadsMonth: number
  isPopular: boolean
}

interface Props {
  plans: Plan[]
  selectedPlan: string
}

type RegisterStep = "plan" | "account" | "payment"

export function RegisterForm({ plans, selectedPlan }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<RegisterStep>("plan")
  const [formData, setFormData] = useState({
    planSlug: selectedPlan || plans[0]?.slug || "",
    billingCycle: "monthly" as "monthly" | "yearly",
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
    document: "",
  })

  const steps: RegisterStep[] = ["plan", "account", "payment"]
  const currentPlan = plans.find((p) => p.slug === formData.planSlug)

  const accountReady =
    formData.companyName.trim() &&
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.trim().length >= 8

  const goStep = (nextStep: RegisterStep) => {
    const currentIndex = steps.indexOf(step)
    const nextIndex = steps.indexOf(nextStep)
    if (nextIndex <= currentIndex) setStep(nextStep)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = (await response.json()) as { error?: string; paymentUrl?: string | null }
      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta")
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        router.push("/painel")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex border-b border-slate-200">
        {steps.map((s, i) => {
          const currentIndex = steps.indexOf(step)
          const enabled = i < currentIndex
          const title = s === "plan" ? "Plano" : s === "account" ? "Conta" : "Pagamento"
          return (
            <button
              key={s}
              onClick={() => goStep(s)}
              type="button"
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                step === s
                  ? "border-b-2 border-indigo-600 bg-indigo-50 text-indigo-600"
                  : enabled
                    ? "text-slate-600 hover:bg-slate-50"
                    : "text-slate-400"
              }`}
            >
              {i + 1}. {title}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error ? <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

        {step === "plan" ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, planSlug: plan.slug })}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    formData.planSlug === plan.slug
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.isPopular ? (
                      <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs text-white">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="text-2xl font-bold">
                    R$ {plan.priceMonthly.toFixed(0)}
                    <span className="text-sm font-normal text-slate-500">/mes</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {plan.maxWebinars === -1 ? "Ilimitado" : plan.maxWebinars} webinars
                  </p>
                  {formData.planSlug === plan.slug ? (
                    <div className="mt-3 flex items-center text-sm text-indigo-600">
                      <Check className="mr-1 h-4 w-4" />
                      Selecionado
                    </div>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="cycle"
                  checked={formData.billingCycle === "monthly"}
                  onChange={() => setFormData({ ...formData, billingCycle: "monthly" })}
                  className="text-indigo-600"
                />
                <span>Mensal</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="cycle"
                  checked={formData.billingCycle === "yearly"}
                  onChange={() => setFormData({ ...formData, billingCycle: "yearly" })}
                  className="text-indigo-600"
                />
                <span>Anual</span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  2 meses gratis
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep("account")} disabled={!formData.planSlug}>
                Continuar
              </Button>
            </div>
          </div>
        ) : null}

        {step === "account" ? (
          <div className="mx-auto max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Sua empresa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimo 8 caracteres"
                minLength={8}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep("plan")}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep("payment")} disabled={!accountReady}>
                Continuar
              </Button>
            </div>
          </div>
        ) : null}

        {step === "payment" ? (
          <div className="mx-auto max-w-md space-y-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="mb-3 font-semibold">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plano</span>
                  <span className="font-medium">{currentPlan?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ciclo</span>
                  <span className="font-medium">
                    {formData.billingCycle === "yearly" ? "Anual" : "Mensal"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">
                    R${" "}
                    {formData.billingCycle === "yearly"
                      ? (currentPlan?.priceYearly || (currentPlan?.priceMonthly || 0) * 10).toFixed(
                          2
                        )
                      : (currentPlan?.priceMonthly || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-slate-500">
              Ao clicar em &quot;Criar Conta&quot;, voce sera redirecionado para escolher a forma de
              pagamento.
            </p>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep("account")}>
                Voltar
              </Button>
              <Button type="submit" disabled={loading || !currentPlan}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  )
}
