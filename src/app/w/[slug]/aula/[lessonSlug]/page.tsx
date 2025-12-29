"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { WebinarHeader } from "@/components/webinar/webinar-header"
import { YouTubePlayer } from "@/components/webinar/youtube-player"
import { Button } from "@/components/ui/button"
import { Gift, Loader2, Play, Lock } from "lucide-react"
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
  offerUrl: string | null         // Da aula
  offerButtonText: string | null  // Da aula
  offerShowAt: number | null      // Da aula
  webinar: {
    name: string
    slug: string
    logoUrl: string | null
  }
  allLessons: Lesson[]
  currentIndex: number
}

interface Lead {
  id: string
  email: string
  name: string
}

export default function LessonPage() {
  const params = useParams()
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
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

  // Buscar lead logado
  useEffect(() => {
    if (!lesson) return

    fetch(`/api/lead/me?webinarSlug=${params.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.lead) {
          setLead(data.lead)
        } else {
          // Se não está logado, redirecionar para página de entrada
          window.location.href = `/w/${params.slug}`
        }
      })
  }, [lesson, params.slug])

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
              <YouTubePlayer
                videoUrl={lesson.videoUrl}
                offerShowAt={lesson.offerShowAt}
                onOfferShow={() => setShowOffer(true)}
              />
            </div>

            {/* Oferta */}
            {showOffer && lesson.offerUrl && (
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
                  <a href={lesson.offerUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100">
                      {lesson.offerButtonText || "Quero Aproveitar"}
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Título e descrição */}
            <div className="mb-6">
              {lead && (
                <p className="text-zinc-400 mb-2">
                  Olá, <span className="text-indigo-400 font-medium">{lead.name.split(" ")[0]}</span>!
                </p>
              )}
              <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
              {lesson.description && <p className="text-zinc-400">{lesson.description}</p>}
            </div>
          </div>

          {/* Lista de aulas (sidebar) */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-zinc-900 rounded-xl overflow-hidden sticky top-24">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide p-4 border-b border-zinc-800">
                Aulas do curso
              </h2>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {lesson.allLessons.map((item, index) => {
                  const isCurrent = item.slug === params.lessonSlug
                  const isLocked = item.isLocked

                  if (isLocked) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 border-b border-zinc-800/50 opacity-50"
                      >
                        <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover grayscale"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Lock className="h-5 w-5 text-zinc-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-zinc-400" />
                          </div>
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
                      className={`flex items-center gap-3 p-3 border-b border-zinc-800/50 transition-colors ${
                        isCurrent
                          ? "bg-indigo-600/20"
                          : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-5 w-5 text-zinc-500" />
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <Play className="h-4 w-4 text-indigo-600 ml-0.5" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isCurrent ? "text-indigo-400" : "text-zinc-300"
                        }`}>
                          {item.title}
                        </p>
                        <p className={`text-xs ${isCurrent ? "text-indigo-400/70" : "text-zinc-500"}`}>
                          Aula {index + 1}
                        </p>
                      </div>
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
