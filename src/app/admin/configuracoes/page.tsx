"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/admin/image-upload"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Save, Image, Globe, Type } from "lucide-react"

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Logo settings
  const [logoType, setLogoType] = useState<"logo" | "text">("text")
  const [adminLogoUrl, setAdminLogoUrl] = useState("")
  const [adminLogoHeight, setAdminLogoHeight] = useState("32")
  const [adminLogoText, setAdminLogoText] = useState("Sistema Webinar")

  // Favicon
  const [adminFaviconUrl, setAdminFaviconUrl] = useState("")

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()

        setLogoType(data.adminLogoType || "text")
        setAdminLogoUrl(data.adminLogoUrl || "")
        setAdminLogoHeight(data.adminLogoHeight || "32")
        setAdminLogoText(data.adminLogoText || "Sistema Webinar")
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
        saveSetting("adminLogoType", logoType),
        saveSetting("adminLogoUrl", adminLogoUrl),
        saveSetting("adminLogoHeight", adminLogoHeight),
        saveSetting("adminLogoText", adminLogoText),
        saveSetting("adminFaviconUrl", adminFaviconUrl),
      ])
      alert("Configurações salvas com sucesso!")
      window.location.reload()
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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Configure a aparência do painel administrativo</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Logo/Texto do Admin */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-slate-600" />
              <CardTitle>Identidade do Painel</CardTitle>
            </div>
            <CardDescription>
              Escolha entre exibir uma logo ou texto na sidebar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Logo */}
            <div className="space-y-2">
              <Label>Tipo de Exibição</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="logoType"
                    value="text"
                    checked={logoType === "text"}
                    onChange={() => setLogoType("text")}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <Type className="h-4 w-4" />
                  <span>Texto</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="logoType"
                    value="logo"
                    checked={logoType === "logo"}
                    onChange={() => setLogoType("logo")}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <Image className="h-4 w-4" />
                  <span>Logo</span>
                </label>
              </div>
            </div>

            {/* Opções de Texto */}
            {logoType === "text" && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                <Label htmlFor="logoText">Texto da Sidebar</Label>
                <Input
                  id="logoText"
                  value={adminLogoText}
                  onChange={(e) => setAdminLogoText(e.target.value)}
                  placeholder="Nome do sistema"
                />
                <p className="text-xs text-slate-500">Este texto aparecerá no topo da sidebar</p>
              </div>
            )}

            {/* Opções de Logo */}
            {logoType === "logo" && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Imagem da Logo</Label>
                  <ImageUpload
                    value={adminLogoUrl}
                    onChange={(url) => setAdminLogoUrl(url || "")}
                    folder="admin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoHeight">Altura da Logo (px)</Label>
                  <Input
                    id="logoHeight"
                    type="number"
                    value={adminLogoHeight}
                    onChange={(e) => setAdminLogoHeight(e.target.value)}
                    placeholder="32"
                    min="20"
                    max="80"
                    className="w-32"
                  />
                  <p className="text-xs text-slate-500">Recomendado: entre 28 e 48 pixels</p>
                </div>

                {/* Preview */}
                {adminLogoUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="p-4 bg-white border rounded-lg">
                      <img
                        src={adminLogoUrl}
                        alt="Preview"
                        style={{ height: `${adminLogoHeight}px` }}
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favicon */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-600" />
              <CardTitle>Favicon do Admin</CardTitle>
            </div>
            <CardDescription>
              Ícone que aparece na aba do navegador (recomendado: 32x32px)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={adminFaviconUrl}
              onChange={(url) => setAdminFaviconUrl(url || "")}
              folder="admin"
            />
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl">
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
