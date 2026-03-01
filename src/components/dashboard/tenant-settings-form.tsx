"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string | null
  customDomain: string | null
}

interface Props {
  tenant: Tenant
}

export function TenantSettingsForm({ tenant }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: tenant.name,
    phone: tenant.phone || "",
    logoUrl: tenant.logoUrl || "",
    faviconUrl: tenant.faviconUrl || "",
    primaryColor: tenant.primaryColor || "#6366f1",
    customDomain: tenant.customDomain || "",
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Configuracoes salvas com sucesso!" })
        router.refresh()
      } else {
        const data = (await response.json()) as { error?: string }
        setMessage({ type: "error", text: data.error || "Erro ao salvar" })
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao salvar configuracoes" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {message ? (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Informacoes da Empresa</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Slug (URL)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">webnar.agemidea.com.br/w/</span>
            <Input value={tenant.slug} disabled className="flex-1 bg-slate-50" />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Visual</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">URL do Favicon</Label>
            <Input
              id="faviconUrl"
              value={formData.faviconUrl}
              onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Cor Primaria</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="primaryColor"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="h-10 w-10 cursor-pointer rounded border border-slate-200"
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-32"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Dominio Personalizado</h3>
        <p className="text-sm text-slate-500">
          Configure um dominio proprio para seus webinars (ex: webinar.suaempresa.com.br)
        </p>

        <div className="space-y-2">
          <Label htmlFor="customDomain">Dominio</Label>
          <Input
            id="customDomain"
            value={formData.customDomain}
            onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
            placeholder="webinar.suaempresa.com.br"
          />
          <p className="text-xs text-slate-500">
            Aponte o CNAME do seu dominio para: cname.vercel-dns.com
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configuracoes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
