"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Gift } from "lucide-react"
import { createLesson, updateLesson } from "@/actions/lesson.actions"
import { ImageUpload } from "@/components/admin/image-upload"

interface Lesson {
  id: string
  title: string
  slug: string
  description?: string | null
  videoUrl: string
  thumbnailUrl?: string | null
  isActive: boolean
  releaseType?: string
  releaseAt?: Date | null
  releaseAfterHours?: number | null
  offerUrl?: string | null
  offerButtonText?: string | null
  offerShowAt?: number | null
}

interface LessonFormProps {
  webinarId: string
  lesson?: Lesson
}

export function LessonForm({ webinarId, lesson }: LessonFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!lesson
  const [hasOffer, setHasOffer] = useState(!!lesson?.offerUrl)
  const [releaseType, setReleaseType] = useState(lesson?.releaseType || "immediate")

  const handleSubmit = async (formData: FormData) => {
    // Se não tem oferta, limpar campos
    if (!hasOffer) {
      formData.set("offerUrl", "")
      formData.set("offerButtonText", "")
      formData.set("offerShowAt", "")
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateLesson(lesson.id, webinarId, formData)
          router.push(`/admin/webinars/${webinarId}/aulas`)
        } else {
          await createLesson(webinarId, formData)
          router.push(`/admin/webinars/${webinarId}/aulas`)
        }
        router.refresh()
      } catch (error) {
        alert(error instanceof Error ? error.message : "Erro ao salvar aula")
      }
    })
  }

  const generateSlug = (title: string) => {
    return title
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
            <CardTitle>Informações da Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={lesson?.title}
                  required
                  placeholder="Ex: Aula 01 - Introdução"
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
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={lesson?.slug}
                  required
                  placeholder="aula-01-introducao"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={lesson?.description || ""}
                placeholder="Descreva o conteúdo da aula..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo (YouTube) *</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                defaultValue={lesson?.videoUrl}
                required
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail da Aula</Label>
              <ImageUpload
                value={lesson?.thumbnailUrl}
                onChange={(url) => {
                  const input = document.querySelector('input[name="thumbnailUrl"]') as HTMLInputElement
                  if (input) input.value = url || ""
                }}
                folder="thumbnails"
              />
              <input type="hidden" name="thumbnailUrl" defaultValue={lesson?.thumbnailUrl || ""} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Aula Ativa</Label>
                <p className="text-sm text-slate-500">Desative para ocultar a aula</p>
              </div>
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={lesson?.isActive ?? true}
                value="true"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liberação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="releaseType">Tipo de Liberação</Label>
              <select
                id="releaseType"
                name="releaseType"
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="immediate">Imediata (disponível agora)</option>
                <option value="scheduled">Data específica</option>
                <option value="sequential">Sequencial (após completar anterior)</option>
              </select>
            </div>

            {releaseType === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="releaseAt">Data de Liberação</Label>
                <Input
                  id="releaseAt"
                  name="releaseAt"
                  type="datetime-local"
                  defaultValue={lesson?.releaseAt ? new Date(lesson.releaseAt).toISOString().slice(0, 16) : ""}
                />
              </div>
            )}

            {releaseType === "sequential" && (
              <div className="space-y-2">
                <Label htmlFor="releaseAfterHours">Liberar após (horas)</Label>
                <Input
                  id="releaseAfterHours"
                  name="releaseAfterHours"
                  type="number"
                  defaultValue={lesson?.releaseAfterHours || 24}
                  min={1}
                  placeholder="24"
                />
                <p className="text-xs text-slate-500">
                  Horas após o lead completar a aula anterior
                </p>
              </div>
            )}

            {releaseType === "immediate" && (
              <p className="text-sm text-slate-500">A aula estará disponível imediatamente para todos os leads.</p>
            )}
          </CardContent>
        </Card>

        {/* Oferta */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-indigo-600" />
                <CardTitle>Oferta</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="hasOffer" className="text-sm text-slate-600">
                  Esta aula possui oferta?
                </Label>
                <Switch
                  id="hasOffer"
                  checked={hasOffer}
                  onCheckedChange={setHasOffer}
                />
              </div>
            </div>
          </CardHeader>
          {hasOffer && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="offerUrl">Link da Oferta *</Label>
                <Input
                  id="offerUrl"
                  name="offerUrl"
                  type="url"
                  defaultValue={lesson?.offerUrl || ""}
                  placeholder="https://checkout.exemplo.com/oferta"
                  required={hasOffer}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offerButtonText">Texto do Botão</Label>
                  <Input
                    id="offerButtonText"
                    name="offerButtonText"
                    defaultValue={lesson?.offerButtonText || "Quero Aproveitar"}
                    placeholder="Quero Aproveitar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offerShowAt">Exibir no segundo *</Label>
                  <Input
                    id="offerShowAt"
                    name="offerShowAt"
                    type="number"
                    defaultValue={lesson?.offerShowAt || ""}
                    placeholder="Ex: 300 (5 minutos)"
                    required={hasOffer}
                  />
                  <p className="text-xs text-slate-500">
                    Momento do vídeo em que a oferta aparece
                  </p>
                </div>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm text-indigo-700">
                  💡 A oferta aparecerá como um banner quando o lead chegar no segundo especificado do vídeo.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

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
              "Criar Aula"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
