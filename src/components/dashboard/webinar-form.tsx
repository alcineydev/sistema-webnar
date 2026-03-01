"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Webinar {
  id?: string
  name: string
  slug: string
  description: string | null
  bannerUrl: string | null
  logoUrl: string | null
  primaryColor: string | null
  status: string
}

interface Props {
  webinar?: Webinar
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function WebinarForm({ webinar }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: webinar?.name || "",
    slug: webinar?.slug || "",
    description: webinar?.description || "",
    bannerUrl: webinar?.bannerUrl || "",
    logoUrl: webinar?.logoUrl || "",
    primaryColor: webinar?.primaryColor || "#6366f1",
    status: webinar?.status === "PUBLISHED" ? "published" : "draft",
  })

  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: webinar?.id ? prev.slug : createSlug(name),
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = webinar?.id ? `/api/dashboard/webinars/${webinar.id}` : "/api/dashboard/webinars"
      const method = webinar?.id ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao salvar webinar")
      }

      router.push(`/painel/webinars/${payload.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Informacoes Basicas</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Webinar</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Ex: Masterclass de Vendas"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(event) => setFormData((prev) => ({ ...prev, slug: createSlug(event.target.value) }))}
              placeholder="masterclass-vendas"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descricao</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descricao do webinar"
            className="h-24 w-full resize-none rounded-lg border border-slate-200 p-3"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bannerUrl">URL do Banner/Thumbnail</Label>
            <Input
              id="bannerUrl"
              value={formData.bannerUrl}
              onChange={(event) => setFormData((prev) => ({ ...prev, bannerUrl: event.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(event) => setFormData((prev) => ({ ...prev, logoUrl: event.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Cor Primaria</Label>
          <div className="flex items-center gap-2">
            <input
              id="primaryColor"
              type="color"
              value={formData.primaryColor}
              onChange={(event) => setFormData((prev) => ({ ...prev, primaryColor: event.target.value }))}
              className="h-10 w-10 cursor-pointer rounded border"
            />
            <Input
              value={formData.primaryColor}
              onChange={(event) => setFormData((prev) => ({ ...prev, primaryColor: event.target.value }))}
              className="w-40"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Publicar Webinar</p>
            <p className="text-xs text-slate-500">Webinars publicados ficam acessiveis ao lead</p>
          </div>
          <Switch
            checked={formData.status === "published"}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, status: checked ? "published" : "draft" }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/painel/webinars">
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
              Salvar Webinar
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
