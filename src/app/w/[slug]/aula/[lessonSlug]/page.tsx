"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { YouTubePlayer } from "@/components/webinar/youtube-player"
import { WebinarHeader } from "@/components/webinar/webinar-header"
import { Button } from "@/components/ui/button"

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
  nextLesson: {
    slug: string
    title: string
  } | null
  prevLesson: {
    slug: string
    title: string
  } | null
}

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export default function LessonPlayerPage() {
  const params = useParams()
  const [data, setData] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOffer, setShowOffer] = useState(false)

  const slug = params.slug as string
  const lessonSlug = params.lessonSlug as string

  useEffect(() => {
    fetch(`/api/webinar/${slug}/aula/${lessonSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Aula não encontrada")
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug, lessonSlug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
        <p className="text-red-400">{error || "Erro ao carregar aula"}</p>
        <Link href={`/w/${slug}`}>
          <Button variant="outline" className="mt-4">
            Voltar para as aulas
          </Button>
        </Link>
      </div>
    )
  }

  const videoId = extractYouTubeId(data.videoUrl)

  return (
    <div className="min-h-screen bg-slate-950">
      <WebinarHeader webinarName={data.webinar.name} />

      <main className="container mx-auto px-4 py-6">
        <Link
          href={`/w/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para as aulas
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {videoId ? (
              <YouTubePlayer
                videoId={videoId}
                offerTime={data.offerShowAt}
                onOfferTrigger={() => setShowOffer(true)}
              />
            ) : (
              <div className="aspect-video rounded-xl bg-slate-800 flex items-center justify-center">
                <p className="text-slate-400">Vídeo não disponível</p>
              </div>
            )}

            <div className="mt-6">
              <h1 className="text-2xl font-bold text-white">{data.title}</h1>
              {data.description && (
                <p className="mt-4 text-slate-400">{data.description}</p>
              )}
            </div>

            <div className="mt-8 flex items-center gap-4">
              {data.prevLesson && (
                <Link href={`/w/${slug}/aula/${data.prevLesson.slug}`}>
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                </Link>
              )}
              {data.nextLesson && (
                <Link href={`/w/${slug}/aula/${data.nextLesson.slug}`}>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Próxima aula
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Offer card - shows when triggered or if no offerShowAt time */}
            {(showOffer || !data.offerShowAt) && data.webinar.offerUrl && (
              <div className="sticky top-24 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/50 to-slate-900 p-6 animate-in fade-in slide-in-from-right-4">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Oferta Especial
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Aproveite esta oportunidade!
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Clique no botão abaixo para acessar a oferta exclusiva.
                </p>
                <a
                  href={data.webinar.offerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  {data.webinar.offerButtonText || "Quero aproveitar"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
