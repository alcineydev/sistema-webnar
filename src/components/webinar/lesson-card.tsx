"use client"

import Link from "next/link"
import { Play, Clock, Lock, CheckCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  slug: string
  description: string | null
  videoDuration: number | null
  releaseAt: Date | null
  thumbnailUrl: string | null
  order: number
}

interface LessonCardProps {
  lesson: Lesson
  webinarSlug: string
  index: number
  totalLessons: number
  isCompleted?: boolean
}

export function LessonCard({ lesson, webinarSlug, isCompleted }: LessonCardProps) {
  const isLocked = lesson.releaseAt && new Date(lesson.releaseAt) > new Date()

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatReleaseDate = (date: Date) => {
    const now = new Date()
    const diff = new Date(date).getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `Libera em ${days} dia${days > 1 ? "s" : ""}`
    if (hours > 0) return `Libera em ${hours}h`
    return `Libera em breve`
  }

  const cardClassName = `group block rounded-xl overflow-hidden transition-all duration-300 ${
    isLocked
      ? "cursor-not-allowed opacity-70"
      : "hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:ring-offset-black"
  }`

  const cardContent = (
    <div className="flex flex-col sm:flex-row bg-zinc-900 dark:bg-zinc-900">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-72 aspect-video sm:aspect-auto sm:h-40 flex-shrink-0">
        {lesson.thumbnailUrl ? (
          <div className={`relative w-full h-full ${isLocked ? "grayscale" : ""}`}>
            <img
              src={lesson.thumbnailUrl}
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-full h-full bg-zinc-800 flex items-center justify-center ${isLocked ? "grayscale" : ""}`}>
            <VideoIcon className="h-12 w-12 text-zinc-600" />
          </div>
        )}

        {/* Overlay de duração */}
        {lesson.videoDuration && !isLocked && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs text-white font-medium">
            {formatDuration(lesson.videoDuration)}
          </div>
        )}

        {/* Overlay de play no hover */}
        {!isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center">
              <Play className="h-7 w-7 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Overlay de bloqueado */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Lock className="h-10 w-10 text-zinc-400" />
          </div>
        )}

        {/* Badge de concluído */}
        {isCompleted && !isLocked && (
          <div className="absolute top-2 right-2 bg-green-600 p-1 rounded-full">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium uppercase tracking-wide ${
            isLocked ? "text-zinc-500" : "text-indigo-400"
          }`}>
            Aula {lesson.order + 1}
          </span>
          {isCompleted && (
            <span className="text-xs text-green-500 font-medium">• Concluída</span>
          )}
        </div>

        <h3 className={`text-lg font-semibold mb-2 ${
          isLocked ? "text-zinc-400" : "text-white group-hover:text-indigo-400 transition-colors"
        }`}>
          {lesson.title}
        </h3>

        {lesson.description && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
            {lesson.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {lesson.videoDuration && !isLocked && (
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="h-4 w-4" />
              {formatDuration(lesson.videoDuration)}
            </span>
          )}

          {isLocked && lesson.releaseAt && (
            <span className="flex items-center gap-1 text-amber-500">
              <Lock className="h-4 w-4" />
              {formatReleaseDate(lesson.releaseAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (isLocked) {
    return (
      <div className={cardClassName}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/w/${webinarSlug}/aula/${lesson.slug}`} className={cardClassName}>
      {cardContent}
    </Link>
  )
}

// Componente Video para quando não tem thumbnail
function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
