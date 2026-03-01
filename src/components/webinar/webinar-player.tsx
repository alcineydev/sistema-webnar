"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronRight, Play } from "lucide-react"

interface Lesson {
  id: string
  title: string
  videoUrl: string
  order: number
  offerUrl: string | null
  offerButtonText: string | null
  offerShowAt: number | null
}

interface Props {
  webinar: {
    id: string
    name: string
    description: string | null
    primaryColor: string | null
    logoUrl: string | null
    lessons: Lesson[]
  }
  lead: {
    id: string
    name: string
    progress?: { lessonId: string; watchedSeconds: number; isCompleted: boolean }[]
  }
  tenant: {
    slug: string
  }
}

function extractYoutubeVideoId(value: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function toEmbedUrl(value: string) {
  const videoId = extractYoutubeVideoId(value)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
}

function mapEventType(value: string) {
  const normalized = value.toLowerCase()
  if (normalized === "registered") return "registered"
  if (normalized === "lesson_started") return "lesson_started"
  if (normalized === "offer_shown") return "offer_shown"
  if (normalized === "offer_clicked") return "offer_clicked"
  return "video_play"
}

export function WebinarPlayer({ webinar, lead, tenant }: Props) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(webinar.lessons[0] || null)
  const [watchedSeconds, setWatchedSeconds] = useState(0)
  const [showOffer, setShowOffer] = useState(false)
  const [offerTracked, setOfferTracked] = useState(false)

  const primaryColor = webinar.primaryColor || "#6366f1"

  const embedUrl = useMemo(() => {
    if (!currentLesson?.videoUrl) return null
    return toEmbedUrl(currentLesson.videoUrl)
  }, [currentLesson?.videoUrl])

  useEffect(() => {
    setWatchedSeconds(0)
    setShowOffer(false)
    setOfferTracked(false)
  }, [currentLesson?.id])

  useEffect(() => {
    if (!currentLesson) return

    const intervalId = window.setInterval(() => {
      setWatchedSeconds((previous) => {
        const next = previous + 5
        void saveProgress(next)

        if (currentLesson.offerShowAt && next >= currentLesson.offerShowAt && !offerTracked) {
          setShowOffer(true)
          setOfferTracked(true)
          void trackEvent("offer_shown", { lessonId: currentLesson.id })
        }

        return next
      })
    }, 5000)

    return () => window.clearInterval(intervalId)
    // Dependemos do ID da aula atual para resetar ciclo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id, offerTracked])

  async function saveProgress(seconds: number) {
    if (!currentLesson) return
    await fetch(`/api/lead/${tenant.slug}/${webinar.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        lessonId: currentLesson.id,
        watchedSeconds: seconds,
      }),
    })
  }

  async function trackEvent(type: string, data?: Record<string, unknown>) {
    await fetch(`/api/lead/${tenant.slug}/${webinar.id}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        lessonId: currentLesson?.id,
        type: mapEventType(type),
        data: data || {},
      }),
    })
  }

  function handleOfferClick() {
    if (!currentLesson?.offerUrl) return
    void trackEvent("offer_clicked", { url: currentLesson.offerUrl })
    window.open(currentLesson.offerUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {webinar.logoUrl ? (
            <img src={webinar.logoUrl} alt={webinar.name} className="h-8" />
          ) : (
            <span className="font-semibold text-white">{webinar.name}</span>
          )}
          <span className="text-sm text-white/70">Ola, {lead.name.split(" ")[0]}</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-3 lg:p-8">
        <div className="lg:col-span-2">
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={currentLesson?.title || webinar.name}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/70">Video indisponivel</div>
            )}
          </div>

          {currentLesson ? (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-white">{currentLesson.title}</h2>
            </div>
          ) : null}

          {showOffer && currentLesson?.offerUrl ? (
            <div className="mt-6 rounded-xl p-6" style={{ backgroundColor: primaryColor }}>
              <h3 className="mb-2 text-xl font-bold text-white">Oferta Especial</h3>
              <p className="mb-4 text-white/90">Aproveite enquanto voce assiste a aula.</p>
              <button
                onClick={handleOfferClick}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-white/90"
              >
                {currentLesson.offerButtonText || "Quero Aproveitar"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <h3 className="mb-4 font-semibold text-white">Aulas</h3>
          <div className="space-y-2">
            {webinar.lessons.map((lesson, index) => {
              const isActive = currentLesson?.id === lesson.id
              const isCompleted = lead.progress?.some(
                (progress) => progress.lessonId === lesson.id && progress.isCompleted
              )

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setCurrentLesson(lesson)
                    void trackEvent("lesson_started", { lessonId: lesson.id })
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      isCompleted ? "bg-green-500 text-white" : "bg-white/10"
                    }`}
                    style={isActive && !isCompleted ? { backgroundColor: primaryColor } : undefined}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isActive ? (
                      <Play className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className="flex-1 truncate">{lesson.title}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-60" />
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-white/60">Tempo monitorado: {watchedSeconds}s</p>
        </div>
      </div>
    </div>
  )
}
