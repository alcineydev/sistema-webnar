"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, GripVertical, Video } from "lucide-react"
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
  videoUrl: string
  order: number
  isActive: boolean
}

interface LessonListProps {
  lessons: Lesson[]
  webinarId: string
}

export function LessonList({ lessons, webinarId }: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Video className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Nenhuma aula criada ainda</p>
          <Link href={`/admin/webinars/${webinarId}/lessons/new`}>
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
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium">{lesson.title}</p>
              <p className="text-sm text-slate-500">/{lesson.slug}</p>
            </div>
            <Badge variant={lesson.isActive ? "default" : "secondary"}>
              {lesson.isActive ? "Ativa" : "Inativa"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/webinars/${webinarId}/lessons/${lesson.id}`}>
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
