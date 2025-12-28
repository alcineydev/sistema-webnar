"use client"

import Link from "next/link"
import { Play, Clock, CheckCircle } from "lucide-react"

interface LessonCardProps {
  lesson: {
    id: string
    title: string
    slug: string
    description: string | null
    videoDuration: number | null
    order: number
  }
  webinarSlug: string
  isCompleted?: boolean
}

export function LessonCard({ lesson, webinarSlug, isCompleted }: LessonCardProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Link href={`/w/${webinarSlug}/aula/${lesson.slug}`}>
      <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-indigo-500/50 hover:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 transition-all group-hover:bg-indigo-600 group-hover:text-white">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-400">
                Aula {lesson.order}
              </span>
              {isCompleted && (
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                  Concluída
                </span>
              )}
            </div>
            <h3 className="mt-1 font-semibold text-white group-hover:text-indigo-400 transition-colors">
              {lesson.title}
            </h3>
            {lesson.description && (
              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                {lesson.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDuration(lesson.videoDuration)}</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 border-2 border-transparent rounded-xl transition-all group-hover:border-indigo-500/20" />
      </div>
    </Link>
  )
}
