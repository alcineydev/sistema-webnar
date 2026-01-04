"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteLesson } from "@/actions/lesson.actions"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  GripVertical,
  Video,
  Clock,
  Gift,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface LessonItem {
  id: string
  title: string
  slug: string
  description: string | null
  videoUrl: string
  videoDuration: number | null
  thumbnailUrl: string | null
  releaseAt: Date | null
  isActive: boolean
  order: number
  offerUrl?: string | null
}

interface LessonListProps {
  lessons: LessonItem[]
  webinarId: string
}

const ITEMS_PER_PAGE = 10

export function LessonList({ lessons, webinarId }: LessonListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(lessons.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentLessons = lessons.slice(startIndex, endIndex)

  async function handleDelete(lessonId: string) {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return

    setDeletingId(lessonId)
    try {
      await deleteLesson(lessonId, webinarId)
    } catch (error) {
      console.error("Error deleting lesson:", error)
      alert("Erro ao excluir aula")
    } finally {
      setDeletingId(null)
      setOpenMenuId(null)
    }
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 mb-4">Nenhuma aula cadastrada</p>
        <Link href={`/admin/webinars/${webinarId}/aulas/nova`}>
          <Button>Criar primeira aula</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Lista de aulas */}
      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {currentLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
          >
            {/* Drag handle */}
            <div className="text-slate-300 cursor-grab">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Thumbnail */}
            <div className="relative w-24 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
              {lesson.thumbnailUrl ? (
                <Image
                  src={lesson.thumbnailUrl}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-6 w-6 text-slate-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                  {startIndex + index + 1}
                </span>
                <h3 className="font-medium text-slate-900 truncate">
                  {lesson.title}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="text-slate-400">/{lesson.slug}</span>
                {lesson.videoDuration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(lesson.videoDuration)}
                  </span>
                )}
                {lesson.offerUrl && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Gift className="h-3.5 w-3.5" />
                    Oferta
                  </span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  lesson.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {lesson.isActive ? "Ativa" : "Inativa"}
              </span>
            </div>

            {/* Actions */}
            <div className="relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenMenuId(openMenuId === lesson.id ? null : lesson.id)}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {openMenuId === lesson.id && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpenMenuId(null)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                    <Link
                      href={`/admin/webinars/${webinarId}/aulas/${lesson.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setOpenMenuId(null)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      disabled={deletingId === lesson.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === lesson.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-slate-500">
            Mostrando {startIndex + 1}-{Math.min(endIndex, lessons.length)} de {lessons.length} aulas
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
