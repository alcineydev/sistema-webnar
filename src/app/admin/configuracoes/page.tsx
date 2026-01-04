"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/admin/image-upload"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Save, Image, Globe } from "lucide-react"

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminLogoUrl, setAdminLogoUrl] = useState("")
  const [adminLogoDarkUrl, setAdminLogoDarkUrl] = useState("")
  const [adminFaviconUrl, setAdminFaviconUrl] = useState("")

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()

        setAdminLogoUrl(data.adminLogoUrl || "")
        setAdminLogoDarkUrl(data.adminLogoDarkUrl || "")
        setAdminFaviconUrl(data.adminFaviconUrl || "")
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  async function saveSetting(key: string, value: string) {
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      })
    } catch (error) {
      console.error("Error saving setting:", error)
      throw error
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all([
        saveSetting("adminLogoUrl", adminLogoUrl),
        saveSetting("adminLogoDarkUrl", adminLogoDarkUrl),
        saveSetting("adminFaviconUrl", adminFaviconUrl),
      ])
      alert("Configurações salvas com sucesso!")
    } catch {
      alert("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Configure a aparência do painel administrativo</p>
      </div>

      <div className="grid gap-6">
        {/* Logo do Admin */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-slate-600" />
              <CardTitle>Logo do Painel</CardTitle>
            </div>
            <CardDescription>
              Logo exibida no cabeçalho do painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Logo Tema Claro</Label>
                <ImageUpload
                  value={adminLogoUrl}
                  onChange={(url) => setAdminLogoUrl(url || "")}
                  folder="admin"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo Tema Escuro</Label>
                <ImageUpload
                  value={adminLogoDarkUrl}
                  onChange={(url) => setAdminLogoDarkUrl(url || "")}
                  folder="admin"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favicon */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-600" />
              <CardTitle>Favicon</CardTitle>
            </div>
            <CardDescription>
              Ícone que aparece na aba do navegador (recomendado: 32x32px ou 64x64px)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <ImageUpload
                value={adminFaviconUrl}
                onChange={(url) => setAdminFaviconUrl(url || "")}
                folder="admin"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
