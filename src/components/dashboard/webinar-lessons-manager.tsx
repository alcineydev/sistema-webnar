"use client"

import { useMemo, useState } from "react"
import { Edit, Plus, Save, Trash2, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"

interface Lesson {
  id: string
  title: string
  slug: string
  videoUrl: string
  order: number
  isActive: boolean
  offerUrl: string | null
  offerButtonText: string | null
  offerShowAt: number | null
}

interface Props {
  webinarId: string
  lessons: Lesson[]
}

interface LessonFormState {
  title: string
  slug: string
  videoUrl: string
  order: number
  isActive: boolean
  offerUrl: string
  offerButtonText: string
  offerShowAt: number
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function initialLessonForm(nextOrder: number): LessonFormState {
  return {
    title: "",
    slug: "",
    videoUrl: "",
    order: nextOrder,
    isActive: true,
    offerUrl: "",
    offerButtonText: "Quero Aproveitar",
    offerShowAt: 0,
  }
}

export function WebinarLessonsManager({ webinarId, lessons }: Props) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextOrder = useMemo(() => {
    if (!lessons.length) return 1
    return Math.max(...lessons.map((lesson) => lesson.order)) + 1
  }, [lessons])

  const [form, setForm] = useState<LessonFormState>(initialLessonForm(nextOrder))

  function openCreate() {
    setError(null)
    setEditing(null)
    setForm(initialLessonForm(nextOrder))
    setCreateOpen(true)
  }

  function openEdit(lesson: Lesson) {
    setError(null)
    setCreateOpen(false)
    setEditing(lesson)
    setForm({
      title: lesson.title,
      slug: lesson.slug,
      videoUrl: lesson.videoUrl,
      order: lesson.order,
      isActive: lesson.isActive,
      offerUrl: lesson.offerUrl || "",
      offerButtonText: lesson.offerButtonText || "Quero Aproveitar",
      offerShowAt: lesson.offerShowAt || 0,
    })
  }

  async function submitCreate() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dashboard/webinars/${webinarId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao criar aula")
      }
      setCreateOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar aula")
    } finally {
      setLoading(false)
    }
  }

  async function submitEdit() {
    if (!editing) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/dashboard/webinars/${webinarId}/lessons/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao atualizar aula")
      }
      setEditing(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar aula")
    } finally {
      setLoading(false)
    }
  }

  async function removeLesson(lessonId: string) {
    if (!window.confirm("Deseja excluir esta aula?")) return
    const response = await fetch(`/api/dashboard/webinars/${webinarId}/lessons/${lessonId}`, {
      method: "DELETE",
    })
    if (response.ok) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Aulas</h3>
          <p className="text-sm text-slate-500">Configure o conteudo e a oferta por aula</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      {!lessons.length ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Nenhuma aula criada.
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2">
                  <Video className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{lesson.title}</p>
                  <p className="text-xs text-slate-500">
                    Ordem {lesson.order} · {lesson.isActive ? "Publicada" : "Oculta"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(lesson)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => void removeLesson(lesson.id)}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600">Excluir</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nova Aula" size="lg">
        <LessonFormFields form={form} setForm={setForm} />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end">
          <Button onClick={() => void submitCreate()} disabled={loading}>
            {loading ? <Save className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Aula
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Aula" size="lg">
        <LessonFormFields form={form} setForm={setForm} />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex justify-end">
          <Button onClick={() => void submitEdit()} disabled={loading}>
            {loading ? <Save className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
            Atualizar Aula
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function LessonFormFields({
  form,
  setForm,
}: {
  form: LessonFormState
  setForm: React.Dispatch<React.SetStateAction<LessonFormState>>
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lesson-title">Titulo</Label>
          <Input
            id="lesson-title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                title: event.target.value,
                slug: prev.slug ? prev.slug : toSlug(event.target.value),
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lesson-slug">Slug</Label>
          <Input
            id="lesson-slug"
            value={form.slug}
            onChange={(event) => setForm((prev) => ({ ...prev, slug: toSlug(event.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson-video">URL do Video (YouTube)</Label>
        <Input
          id="lesson-video"
          value={form.videoUrl}
          onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lesson-order">Ordem</Label>
          <Input
            id="lesson-order"
            type="number"
            min={1}
            value={form.order}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, order: Number.parseInt(event.target.value || "1", 10) || 1 }))
            }
          />
        </div>
        <div className="flex items-end justify-between rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Aula ativa</p>
            <p className="text-xs text-slate-500">Somente aulas ativas aparecem no player</p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <h4 className="font-medium text-slate-900">Oferta (CTA)</h4>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="offer-url">URL da Oferta</Label>
            <Input
              id="offer-url"
              value={form.offerUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, offerUrl: event.target.value }))}
              placeholder="https://checkout..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-button-text">Texto do Botao</Label>
            <Input
              id="offer-button-text"
              value={form.offerButtonText}
              onChange={(event) => setForm((prev) => ({ ...prev, offerButtonText: event.target.value }))}
              placeholder="Quero Aproveitar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-show-at">Mostrar no segundo</Label>
            <Input
              id="offer-show-at"
              type="number"
              min={0}
              value={form.offerShowAt}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  offerShowAt: Number.parseInt(event.target.value || "0", 10) || 0,
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
