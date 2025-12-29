"use client"

import { useTransition } from "react"
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

interface Webinar {
  id: string
  name: string
  slug: string
  description?: string | null
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  releaseType: "IMMEDIATE" | "SCHEDULED" | "SEQUENTIAL"
  primaryColor?: string | null
}

interface WebinarFormProps {
  webinar?: Webinar
}

export function WebinarForm({ webinar }: WebinarFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!webinar

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

              <div className="space-y-2">
                <Label htmlFor="releaseType">Tipo de Liberação</Label>
                <Select name="releaseType" defaultValue={webinar?.releaseType || "IMMEDIATE"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATE">Imediata</SelectItem>
                    <SelectItem value="SCHEDULED">Agendada</SelectItem>
                    <SelectItem value="SEQUENTIAL">Sequencial</SelectItem>
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

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            💡 <strong>Dica:</strong> As ofertas agora são configuradas individualmente em cada aula.
            Acesse a aba "Aulas" para configurar ofertas específicas por aula.
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
