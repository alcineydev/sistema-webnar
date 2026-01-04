"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createWebinar, updateWebinar } from "@/actions/webinar.actions"
import { ImageUpload } from "@/components/admin/image-upload"

interface Webinar {
  id: string
  name: string
  slug: string
  description?: string | null
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  primaryColor?: string | null
  logoLightUrl?: string | null
  logoDarkUrl?: string | null
  faviconUrl?: string | null
  loginBgType?: string | null
  loginBgImage?: string | null
  loginBgCode?: string | null
}

interface WebinarFormProps {
  webinar?: Webinar
}

export function WebinarForm({ webinar }: WebinarFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!webinar

  // Estados para personalização visual
  const [logoLightUrl, setLogoLightUrl] = useState(webinar?.logoLightUrl || "")
  const [logoDarkUrl, setLogoDarkUrl] = useState(webinar?.logoDarkUrl || "")
  const [faviconUrl, setFaviconUrl] = useState(webinar?.faviconUrl || "")
  const [loginBgType, setLoginBgType] = useState(webinar?.loginBgType || "code")
  const [loginBgImage, setLoginBgImage] = useState(webinar?.loginBgImage || "")
  const [loginBgCode, setLoginBgCode] = useState(webinar?.loginBgCode || "")

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateWebinar(webinar.id, formData)
        } else {
          await createWebinar(formData)
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erro ao salvar webinar")
      }
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  return (
    <form action={handleSubmit}>
      {/* Hidden inputs para campos de personalização visual */}
      <input type="hidden" name="logoLightUrl" value={logoLightUrl} />
      <input type="hidden" name="logoDarkUrl" value={logoDarkUrl} />
      <input type="hidden" name="faviconUrl" value={faviconUrl} />
      <input type="hidden" name="loginBgType" value={loginBgType} />
      <input type="hidden" name="loginBgImage" value={loginBgImage} />
      <input type="hidden" name="loginBgCode" value={loginBgCode} />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Webinar *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={webinar?.name}
                required
                placeholder="Ex: Lançamento Método XYZ"
                onChange={(e) => {
                  if (!isEditing) {
                    const slugInput = document.getElementById("slug") as HTMLInputElement
                    if (slugInput) {
                      slugInput.value = generateSlug(e.target.value)
                    }
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">/w/</span>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={webinar?.slug}
                  required
                  placeholder="metodo-xyz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={webinar?.description || ""}
                placeholder="Descreva seu webinar..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={webinar?.status || "DRAFT"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Principal</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  defaultValue={webinar?.primaryColor || "#6366f1"}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  defaultValue={webinar?.primaryColor || "#6366f1"}
                  className="flex-1"
                  onChange={(e) => {
                    const colorInput = document.getElementById("primaryColor") as HTMLInputElement
                    if (colorInput) colorInput.value = e.target.value
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logos por Tema */}
        <Card>
          <CardHeader>
            <CardTitle>Logos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Logo Tema Claro</Label>
                <p className="text-xs text-slate-500">Usada quando o tema claro está ativo</p>
                <ImageUpload
                  value={logoLightUrl}
                  onChange={(url) => setLogoLightUrl(url || "")}
                  folder="logos"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo Tema Escuro</Label>
                <p className="text-xs text-slate-500">Usada quando o tema escuro está ativo</p>
                <ImageUpload
                  value={logoDarkUrl}
                  onChange={(url) => setLogoDarkUrl(url || "")}
                  folder="logos"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Favicon</Label>
              <p className="text-xs text-slate-500">Ícone que aparece na aba do navegador (recomendado: 32x32px)</p>
              <ImageUpload
                value={faviconUrl}
                onChange={(url) => setFaviconUrl(url || "")}
                folder="favicons"
              />
            </div>
          </CardContent>
        </Card>

        {/* Background da Tela de Login */}
        <Card>
          <CardHeader>
            <CardTitle>Tela de Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Configure o visual da tela de login/cadastro dos leads</p>

            <div className="space-y-2">
              <Label>Tipo de Background</Label>
              <select
                value={loginBgType}
                onChange={(e) => setLoginBgType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="code">Código HTML/CSS/JS (Animação)</option>
                <option value="image">Imagem</option>
                <option value="gif">GIF Animado</option>
              </select>
            </div>

            {loginBgType === "image" && (
              <div className="space-y-2">
                <Label>Imagem de Fundo</Label>
                <ImageUpload
                  value={loginBgImage}
                  onChange={(url) => setLoginBgImage(url || "")}
                  folder="backgrounds"
                />
              </div>
            )}

            {loginBgType === "gif" && (
              <div className="space-y-2">
                <Label>GIF de Fundo</Label>
                <ImageUpload
                  value={loginBgImage}
                  onChange={(url) => setLoginBgImage(url || "")}
                  folder="backgrounds"
                />
                <p className="text-xs text-slate-500">Faça upload de um GIF animado</p>
              </div>
            )}

            {loginBgType === "code" && (
              <div className="space-y-2">
                <Label>Código HTML/CSS/JS</Label>
                <textarea
                  value={loginBgCode}
                  onChange={(e) => setLoginBgCode(e.target.value)}
                  className="w-full h-64 p-3 font-mono text-sm border border-slate-300 rounded-lg"
                  placeholder="<style>...</style><div>...</div>"
                />
                <p className="text-xs text-slate-500">
                  Deixe vazio para usar o background padrão com partículas e efeitos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Dica:</strong> As ofertas agora são configuradas individualmente em cada aula.
            Acesse a aba Aulas para configurar ofertas específicas por aula.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar Alterações"
            ) : (
              "Criar Webinar"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
