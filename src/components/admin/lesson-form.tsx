"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createLesson, updateLesson } from "@/actions/lesson.actions"

interface Lesson {
  id: string
  title: string
  slug: string
  description?: string | null
  videoUrl: string
  thumbnailUrl?: string | null
  isActive: boolean
  releaseAt?: Date | null
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

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateLesson(lesson.id, webinarId, formData)
          router.push(`/admin/webinars/${webinarId}`)
        } else {
          await createLesson(webinarId, formData)
          router.push(`/admin/webinars/${webinarId}`)
        }
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
              <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                defaultValue={lesson?.thumbnailUrl || ""}
              />
              <p className="text-xs text-slate-500">
                Dica: Para vídeos do YouTube, use: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
              </p>
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
            <CardTitle>Liberação e Oferta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="releaseAt">Data de Liberação</Label>
              <Input
                id="releaseAt"
                name="releaseAt"
                type="datetime-local"
                defaultValue={lesson?.releaseAt ? new Date(lesson.releaseAt).toISOString().slice(0, 16) : ""}
              />
              <p className="text-sm text-slate-500">Deixe vazio para liberação imediata</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerShowAt">Mostrar Oferta aos (segundos)</Label>
              <Input
                id="offerShowAt"
                name="offerShowAt"
                type="number"
                min="0"
                defaultValue={lesson?.offerShowAt || ""}
                placeholder="Ex: 1800 (30 minutos)"
              />
              <p className="text-sm text-slate-500">Tempo em segundos para mostrar o botão de oferta</p>
            </div>
          </CardContent>
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
