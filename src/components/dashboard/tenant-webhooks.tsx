"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/ui/status-badge"

interface TenantWebhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret: string | null
  createdAt: Date | string
}

interface Props {
  webhooks: TenantWebhook[]
  canUseWebhooks: boolean
}

export function TenantWebhooks({ webhooks, canUseWebhooks }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [events, setEvents] = useState("lead.created,lead.progress")
  const [secret, setSecret] = useState("")

  const handleCreate = async () => {
    if (!name.trim() || !url.trim()) return
    setSaving(true)

    try {
      const response = await fetch("/api/dashboard/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          secret: secret || null,
          events: events
            .split(",")
            .map((event) => event.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        setName("")
        setUrl("")
        setSecret("")
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleWebhook = async (id: string, isActive: boolean) => {
    await fetch(`/api/dashboard/webhooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    })
    router.refresh()
  }

  const deleteWebhook = async (id: string) => {
    const confirmed = window.confirm("Deseja excluir este webhook?")
    if (!confirmed) return
    await fetch(`/api/dashboard/webhooks/${id}`, { method: "DELETE" })
    router.refresh()
  }

  if (!canUseWebhooks) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-800">Recurso indisponivel no plano atual</h3>
        <p className="mt-1 text-sm text-amber-700">
          Faca upgrade para habilitar webhooks em Integracoes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Novo Webhook</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: N8N Lead Webhook"
            />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Eventos</Label>
            <Input
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              placeholder="lead.created,lead.progress"
            />
          </div>
          <div className="space-y-2">
            <Label>Secret (opcional)</Label>
            <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="chave-secreta" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleCreate} disabled={saving || !name.trim() || !url.trim()}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Criar Webhook
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Webhooks Cadastrados</h3>
        </div>
        {webhooks.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Webhook className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            Nenhum webhook cadastrado
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{webhook.name}</p>
                  <p className="truncate text-sm text-slate-500">{webhook.url}</p>
                  <p className="mt-1 text-xs text-slate-400">{webhook.events.join(", ")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={webhook.isActive ? "active" : "suspended"} />
                  <Switch
                    checked={webhook.isActive}
                    onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                  />
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
