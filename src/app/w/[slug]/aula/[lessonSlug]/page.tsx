"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { YouTubePlayer } from "@/components/webinar/youtube-player"
import { WebinarHeader } from "@/components/webinar/webinar-header"
import { LeadAuth } from "@/components/webinar/lead-auth"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Play,
  Lock,
  Gift,
  Video
} from "lucide-react"
import Link from "next/link"

// Helper para ajustar cor (escurecer/clarear)
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "")
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

interface Lesson {
  id: string
  title: string
  slug: string
  order: number
  thumbnailUrl: string | null
  isLocked: boolean
}

interface Lead {
  id: string
  email: string
  name: string
}

interface LessonData {
  id: string
  title: string
  description: string | null
  videoUrl: string
  videoDuration: number | null
  offerUrl: string | null
  offerButtonText: string | null
  offerShowAt: number | null
  webinar: {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    primaryColor: string | null
  }
  allLessons: Lesson[]
}

export default function LessonPage() {
  const params = useParams()
  const slug = params.slug as string
  const lessonSlug = params.lessonSlug as string

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingLead, setCheckingLead] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOffer, setShowOffer] = useState(false)
  const [offerShownTracked, setOfferShownTracked] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Tracking refs
  const lastTrackedTimeRef = useRef(0)
  const trackedMilestonesRef = useRef<Set<number>>(new Set())

  // Buscar dados da aula
  useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`/api/webinar/${slug}/aula/${lessonSlug}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Erro ao carregar aula")
          return
        }

        setLesson(data)
      } catch {
        setError("Erro ao carregar aula")
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [slug, lessonSlug])

  // Verificar se lead está logado
  useEffect(() => {
    if (!lesson) return

    async function checkLead() {
      try {
        const response = await fetch(`/api/lead/me?webinarSlug=${slug}`)
        const data = await response.json()

        if (data.lead) {
          setLead(data.lead)
        }
      } catch (error) {
        console.error("Error checking lead:", error)
      } finally {
        setCheckingLead(false)
      }
    }

    checkLead()
  }, [lesson, slug])

  // Reset tracking quando muda de aula
  useEffect(() => {
    lastTrackedTimeRef.current = 0
    trackedMilestonesRef.current = new Set()
    setShowOffer(false)
    setOfferShownTracked(false)
  }, [lessonSlug])

  // Função para registrar evento
  const trackEvent = useCallback(async (eventType: string, videoTime?: number, data?: Record<string, unknown>) => {
    if (!lesson || !lead) return

    try {
      await fetch("/api/lead/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          lessonId: lesson.id,
          webinarId: lesson.webinar.id,
          videoTime,
          data
        })
      })
      console.log("[Tracking] Event sent:", eventType)
    } catch (error) {
      console.error("[Tracking] Event error:", error)
    }
  }, [lesson, lead])

  // Função para salvar progresso
  const trackProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!lesson || !lead || duration <= 0) return

    const percentWatched = Math.min((currentTime / duration) * 100, 100)

    // Salvar progresso a cada 10 segundos
    if (currentTime - lastTrackedTimeRef.current >= 10) {
      lastTrackedTimeRef.current = currentTime

      try {
        await fetch("/api/lead/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lesson.id,
            webinarId: lesson.webinar.id,
            watchedSeconds: Math.floor(currentTime),
            percentWatched: Math.floor(percentWatched)
          })
        })
        console.log("[Tracking] Progress saved:", Math.floor(percentWatched) + "%")
      } catch (error) {
        console.error("[Tracking] Progress error:", error)
      }
    }

    // Eventos de milestone (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100]
    for (const milestone of milestones) {
      if (percentWatched >= milestone && !trackedMilestonesRef.current.has(milestone)) {
        trackedMilestonesRef.current.add(milestone)

        const eventMap: Record<number, string> = {
          25: "VIDEO_PROGRESS_25",
          50: "VIDEO_PROGRESS_50",
          75: "VIDEO_PROGRESS_75",
          100: "VIDEO_COMPLETED"
        }

        trackEvent(eventMap[milestone], currentTime)
      }
    }

    // Mostrar oferta no tempo configurado
    if (lesson.offerShowAt && lesson.offerUrl && currentTime >= lesson.offerShowAt && !showOffer) {
      setShowOffer(true)

      if (!offerShownTracked) {
        setOfferShownTracked(true)
        trackEvent("OFFER_SHOWN", currentTime)
      }
    }
  }, [lesson, lead, showOffer, offerShownTracked, trackEvent])

  // Handler de play
  const handlePlay = useCallback(() => {
    trackEvent("VIDEO_PLAY")
  }, [trackEvent])

  // Handler de pause
  const handlePause = useCallback((currentTime: number) => {
    trackEvent("VIDEO_PAUSE", currentTime)
  }, [trackEvent])

  // Handler de fim do vídeo
  const handleVideoEnded = useCallback(() => {
    trackEvent("VIDEO_COMPLETED")
  }, [trackEvent])

  // Handler de clique na oferta
  const handleOfferClick = useCallback(() => {
    trackEvent("OFFER_CLICKED")
  }, [trackEvent])

  // Loading
  if (loading || checkingLead) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  // Erro
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Aula não encontrada"}</p>
          <Link href={`/w/${slug}`}>
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Se não está logado, mostrar tela de login
  if (!lead) {
    return (
      <LeadAuth
        webinarId={lesson.webinar.id}
        webinarSlug={lesson.webinar.slug}
        webinarName={lesson.webinar.name}
        webinarDescription={lesson.webinar.description}
        logoUrl={lesson.webinar.logoUrl}
        onSuccess={(newLead) => setLead(newLead)}
      />
    )
  }

  const primaryColor = lesson.webinar.primaryColor || "#6366f1"

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <WebinarHeader
        webinarName={lesson.webinar.name}
        webinarSlug={lesson.webinar.slug}
        logoUrl={lesson.webinar.logoUrl}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Saudação personalizada */}
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Olá, <span className="font-medium" style={{ color: primaryColor }}>{lead.name.split(" ")[0]}</span>! 👋
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Player e conteúdo principal */}
          <div className="flex-1">
            {/* Player */}
            <div className="mb-6 w-full">
              <YouTubePlayer
                videoUrl={lesson.videoUrl}
                primaryColor={primaryColor}
                onEnded={handleVideoEnded}
                onTimeUpdate={trackProgress}
                onPlay={handlePlay}
                onPause={handlePause}
              />
            </div>

            {/* Oferta */}
            {showOffer && lesson.offerUrl && (
              <div
                className="mb-6 p-6 rounded-xl text-white animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${adjustColor(primaryColor, 40)})`
                }}
              >
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
                  <a
                    href={lesson.offerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOfferClick}
                  >
                    <Button
                      size="lg"
                      className="hover:opacity-90"
                      style={{ backgroundColor: "white", color: primaryColor }}
                    >
                      {lesson.offerButtonText || "Quero Aproveitar"}
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Título e descrição */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">{lesson.title}</h1>
              {lesson.description && (
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                  <div
                    className={`prose dark:prose-invert prose-sm max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:hover:text-indigo-500 dark:prose-a:hover:text-indigo-300 ${
                      !showFullDescription ? "line-clamp-3" : ""
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: lesson.description.startsWith("<")
                        ? lesson.description
                        : lesson.description
                            .replace(/\n/g, "<br/>")
                            .replace(
                              /(https?:\/\/[^\s<]+)/g,
                              '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
                            )
                    }}
                  />
                  {lesson.description.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-3 text-sm font-medium hover:opacity-80"
                      style={{ color: primaryColor }}
                    >
                      {showFullDescription ? "Ver menos ▲" : "Ver mais ▼"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lista de aulas */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 sticky top-24">
              <h3 className="text-zinc-900 dark:text-white font-semibold mb-4">Aulas</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {lesson.allLessons.map((l, index) => {
                  const isCurrent = l.slug === lessonSlug
                  const isLocked = l.isLocked

                  return (
                    <div
                      key={l.id}
                      className={`relative rounded-lg overflow-hidden ${
                        isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      {!isLocked ? (
                        <Link href={`/w/${slug}/aula/${l.slug}`}>
                          <div
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isCurrent ? "border" : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            }`}
                            style={isCurrent ? {
                              backgroundColor: `${primaryColor}20`,
                              borderColor: `${primaryColor}50`
                            } : {}}
                          >
                            {/* Thumbnail */}
                            <div className="relative w-28 h-16 flex-shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                              {l.thumbnailUrl ? (
                                <img
                                  src={l.thumbnailUrl}
                                  alt={l.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                                </div>
                              )}
                              {isCurrent && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-zinc-500 mb-1">Aula {index + 1}</p>
                              <p
                                className={`text-sm font-medium truncate ${!isCurrent ? "text-zinc-900 dark:text-white" : ""}`}
                                style={isCurrent ? { color: primaryColor } : {}}
                              >
                                {l.title}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50">
                          {/* Thumbnail locked */}
                          <div className="relative w-28 h-16 flex-shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 grayscale">
                            {l.thumbnailUrl ? (
                              <img
                                src={l.thumbnailUrl}
                                alt={l.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Lock className="h-5 w-5 text-zinc-400" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-500 mb-1">Aula {index + 1}</p>
                            <p className="text-sm font-medium text-zinc-500 truncate">
                              {l.title}
                            </p>
                            <p className="text-xs text-zinc-600">Em breve</p>
                          </div>
                        </div>
                      )}
                    </div>
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
