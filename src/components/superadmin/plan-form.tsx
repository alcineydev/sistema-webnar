"use client"

import type { FormEvent } from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Plan {
  id?: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceQuarterly: number | null
  priceYearly: number | null
  maxWebinars: number
  maxLessons: number
  maxLeadsMonth: number
  maxStorageGB: number
  maxUsers: number
  customDomain: boolean
  whiteLabel: boolean
  webhooks: boolean
  pixels: boolean
  prioritySupport: boolean
  isPopular: boolean
  isActive: boolean
  sortOrder: number
}

interface Props {
  plan?: Plan
}

function toNullableFloat(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function toInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function PlanForm({ plan }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Plan>({
    id: plan?.id,
    name: plan?.name || "",
    slug: plan?.slug || "",
    description: plan?.description || "",
    priceMonthly: plan?.priceMonthly || 0,
    priceQuarterly: plan?.priceQuarterly || null,
    priceYearly: plan?.priceYearly || null,
    maxWebinars: plan?.maxWebinars ?? 5,
    maxLessons: plan?.maxLessons ?? 20,
    maxLeadsMonth: plan?.maxLeadsMonth ?? 1000,
    maxStorageGB: plan?.maxStorageGB ?? 5,
    maxUsers: plan?.maxUsers ?? 1,
    customDomain: plan?.customDomain ?? false,
    whiteLabel: plan?.whiteLabel ?? false,
    webhooks: plan?.webhooks ?? false,
    pixels: plan?.pixels ?? true,
    prioritySupport: plan?.prioritySupport ?? false,
    isPopular: plan?.isPopular ?? false,
    isActive: plan?.isActive ?? true,
    sortOrder: plan?.sortOrder ?? 0,
  })

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: plan?.id ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = plan?.id ? `/api/superadmin/plans/${plan.id}` : "/api/superadmin/plans"

      const response = await fetch(url, {
        method: plan?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error || "Erro ao salvar plano")
      }

      router.push("/superadmin/planos")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Informacoes Basicas</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Profissional"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="profissional"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descricao</Label>
          <Input
            id="description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descricao curta do plano"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Precos</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="priceMonthly">Mensal (R$)</Label>
            <Input
              id="priceMonthly"
              type="number"
              step="0.01"
              value={formData.priceMonthly}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priceMonthly: Number(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceQuarterly">Trimestral (R$)</Label>
            <Input
              id="priceQuarterly"
              type="number"
              step="0.01"
              value={formData.priceQuarterly ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priceQuarterly: toNullableFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceYearly">Anual (R$)</Label>
            <Input
              id="priceYearly"
              type="number"
              step="0.01"
              value={formData.priceYearly ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priceYearly: toNullableFloat(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Limites</h3>
        <p className="text-sm text-slate-500">Use -1 para ilimitado</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="maxWebinars">Webinars</Label>
            <Input
              id="maxWebinars"
              type="number"
              value={formData.maxWebinars}
              onChange={(e) =>
                setFormData({ ...formData, maxWebinars: toInt(e.target.value, 0) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxLessons">Aulas por Webinar</Label>
            <Input
              id="maxLessons"
              type="number"
              value={formData.maxLessons}
              onChange={(e) =>
                setFormData({ ...formData, maxLessons: toInt(e.target.value, 0) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxLeadsMonth">Leads/Mes</Label>
            <Input
              id="maxLeadsMonth"
              type="number"
              value={formData.maxLeadsMonth}
              onChange={(e) =>
                setFormData({ ...formData, maxLeadsMonth: toInt(e.target.value, 0) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStorageGB">Storage (GB)</Label>
            <Input
              id="maxStorageGB"
              type="number"
              value={formData.maxStorageGB}
              onChange={(e) =>
                setFormData({ ...formData, maxStorageGB: toInt(e.target.value, 0) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUsers">Usuarios</Label>
            <Input
              id="maxUsers"
              type="number"
              value={formData.maxUsers}
              onChange={(e) =>
                setFormData({ ...formData, maxUsers: toInt(e.target.value, 1) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Ordem</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: toInt(e.target.value, 0) })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Recursos</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SwitchField
            label="Dominio Personalizado"
            checked={formData.customDomain}
            onChange={(checked) => setFormData({ ...formData, customDomain: checked })}
          />
          <SwitchField
            label="White-label"
            checked={formData.whiteLabel}
            onChange={(checked) => setFormData({ ...formData, whiteLabel: checked })}
          />
          <SwitchField
            label="Webhooks"
            checked={formData.webhooks}
            onChange={(checked) => setFormData({ ...formData, webhooks: checked })}
          />
          <SwitchField
            label="Pixels de Rastreamento"
            checked={formData.pixels}
            onChange={(checked) => setFormData({ ...formData, pixels: checked })}
          />
          <SwitchField
            label="Suporte Prioritario"
            checked={formData.prioritySupport}
            onChange={(checked) => setFormData({ ...formData, prioritySupport: checked })}
          />
          <SwitchField
            label="Destacar como Popular"
            checked={formData.isPopular}
            onChange={(checked) => setFormData({ ...formData, isPopular: checked })}
          />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <SwitchField
            label="Plano Ativo"
            description="Desative para ocultar o plano para novos clientes"
            checked={formData.isActive}
            onChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/superadmin/planos">
          <Button type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Plano
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function SwitchField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
