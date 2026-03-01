"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
  webinar: {
    id: string
    name: string
    description: string | null
    bannerUrl: string | null
    primaryColor: string | null
    logoUrl: string | null
  }
  tenant: {
    slug: string
    name: string
  }
}

export function LeadCapture({ webinar, tenant }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lead/${tenant.slug}/${webinar.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao registrar")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = webinar.primaryColor || "#6366f1"

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        {webinar.logoUrl ? (
          <div className="mb-8 text-center">
            <img src={webinar.logoUrl} alt={tenant.name} className="mx-auto h-12" />
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {webinar.bannerUrl ? (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img src={webinar.bannerUrl} alt={webinar.name} className="h-48 w-full object-cover" />
            </div>
          ) : null}

          <h1 className="mb-2 text-2xl font-bold text-slate-900">{webinar.name}</h1>
          {webinar.description ? <p className="mb-6 text-slate-500">{webinar.description}</p> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp (opcional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: primaryColor }}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Assistir Agora"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
