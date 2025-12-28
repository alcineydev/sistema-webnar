"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { WebinarHeader } from "@/components/webinar/webinar-header"
import { YouTubePlayer } from "@/components/webinar/youtube-player"
import { Button } from "@/components/ui/button"
import { Gift, Loader2, Play, Lock, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: string
  title: string
  slug: string
  order: number
  thumbnailUrl: string | null
  isLocked: boolean
}

interface LessonData {
  id: string
  title: string
  description: string | null
  videoUrl: string
  videoDuration: number | null
  offerShowAt: number | null
  webinar: {
    name: string
    slug: string
    logoUrl: string | null
    offerUrl: string | null
    offerButtonText: string | null
  }
  allLessons: Lesson[]
  currentIndex: number
}

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export default function LessonPage() {
  const params = useParams()
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOffer, setShowOffer] = useState(false)

  useEffect(() => {
    fetch(`/api/webinar/${params.slug}/aula/${params.lessonSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLesson(data)
        }
      })
      .finally(() => setLoading(false))
  }, [params.slug, params.lessonSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Aula não encontrada</p>
          <Link href={`/w/${params.slug}`}>
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  const videoId = extractYouTubeId(lesson.videoUrl)

  return (
    <div className="min-h-screen bg-black">
      <WebinarHeader
        webinarName={lesson.webinar.name}
        webinarSlug={lesson.webinar.slug}
        logoUrl={lesson.webinar.logoUrl}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Player e conteúdo principal */}
          <div className="flex-1">
            {/* Player */}
            <div className="mb-6">
              {videoId ? (
                <YouTubePlayer
                  videoId={videoId}
                  offerTime={lesson.offerShowAt}
                  onOfferTrigger={() => setShowOffer(true)}
                />
              ) : (
                <div className="aspect-video rounded-xl bg-zinc-800 flex items-center justify-center">
                  <p className="text-zinc-400">Vídeo não disponível</p>
                </div>
              )}
            </div>

            {/* Oferta */}
            {showOffer && lesson.webinar.offerUrl && (
              <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Oferta Especial Disponível!</p>
                      <p className="text-white/80 text-sm">Aproveite esta oportunidade exclusiva</p>
                    </div>
                  </div>
                  <a href={lesson.webinar.offerUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100">
                      {lesson.webinar.offerButtonText || "Quero Aproveitar"}
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Título e descrição */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
              {lesson.description && <p className="text-zinc-400">{lesson.description}</p>}
            </div>
          </div>

          {/* Lista de aulas (sidebar) */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-zinc-900 rounded-xl p-4 sticky top-24">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                Aulas do curso
              </h2>
              <div className="space-y-2">
                {lesson.allLessons.map((item, index) => {
                  const isCurrent = item.slug === params.lessonSlug
                  const isLocked = item.isLocked

                  if (isLocked) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 opacity-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                          <Lock className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-500 truncate">{item.title}</p>
                          <p className="text-xs text-zinc-600">Bloqueada</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      href={`/w/${lesson.webinar.slug}/aula/${item.slug}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isCurrent ? "bg-white/20" : "bg-zinc-700"
                        }`}
                      >
                        {isCurrent ? (
                          <Play className="h-4 w-4 ml-0.5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className={`text-xs ${isCurrent ? "text-white/70" : "text-zinc-500"}`}>
                          Aula {index + 1}
                        </p>
                      </div>
                      {isCurrent && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
