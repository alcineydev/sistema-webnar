"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, GripVertical, Video, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteLesson } from "@/actions/lesson.actions"

interface Lesson {
  id: string
  title: string
  slug: string
  description?: string | null
  videoUrl: string
  thumbnailUrl?: string | null
  videoDuration?: number | null
  releaseAt?: Date | null
  order: number
  isActive: boolean
}

interface LessonListProps {
  lessons: Lesson[]
  webinarId: string
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatDate(date: Date | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LessonList({ lessons, webinarId }: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Video className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Nenhuma aula criada ainda</p>
          <Link href={`/admin/webinars/${webinarId}/aulas/nova`}>
            <Button>Criar primeira aula</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => (
        <Card key={lesson.id}>
          <CardContent className="flex items-center gap-4 py-4">
            <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />

            {/* Thumbnail */}
            {lesson.thumbnailUrl ? (
              <img
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-20 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="h-8 w-8 text-slate-400" />
              </div>
            )}

            {/* Número da aula */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-medium flex-shrink-0">
              {index + 1}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{lesson.title}</p>
              <p className="text-sm text-slate-500 truncate">/{lesson.slug}</p>
              {lesson.description && (
                <p className="text-sm text-slate-400 truncate mt-1">{lesson.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                {lesson.videoDuration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(lesson.videoDuration)}
                  </span>
                )}
                {lesson.releaseAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(lesson.releaseAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={lesson.isActive ? "default" : "secondary"}>
                {lesson.isActive ? "Ativa" : "Inativa"}
              </Badge>
              {lesson.releaseAt && new Date(lesson.releaseAt) > new Date() && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Agendada
                </Badge>
              )}
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/webinars/${webinarId}/aulas/${lesson.id}`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    if (confirm("Tem certeza que deseja excluir esta aula?")) {
                      await deleteLesson(lesson.id, webinarId)
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
