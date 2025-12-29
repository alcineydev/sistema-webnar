"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { LeadAuth } from "@/components/webinar/lead-auth"
import { Loader2 } from "lucide-react"

interface Webinar {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  firstLessonSlug: string | null
}

interface Lead {
  id: string
  email: string
  name: string
}

export default function WebinarEntryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const token = searchParams.get("token")

  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do webinar e verificar lead logado
  useEffect(() => {
    async function loadData() {
      try {
        // Buscar webinar
        const webinarRes = await fetch(`/api/webinar/${slug}`)
        const webinarData = await webinarRes.json()

        if (!webinarRes.ok) {
          setError("Webinar não encontrado")
          return
        }

        setWebinar(webinarData)

        // Se tem token, fazer login automático
        if (token) {
          const authRes = await fetch("/api/lead/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, webinarSlug: slug })
          })

          if (authRes.ok) {
            const authData = await authRes.json()
            if (authData.lead) {
              setLead(authData.lead)
              // Redirecionar para primeira aula
              if (webinarData.firstLessonSlug) {
                router.push(`/w/${slug}/aula/${webinarData.firstLessonSlug}`)
                return
              }
            }
          }
        }

        // Verificar se já está logado
        const meRes = await fetch(`/api/lead/me?webinarSlug=${slug}`)
        const meData = await meRes.json()

        if (meData.lead) {
          setLead(meData.lead)
          // Redirecionar para primeira aula
          if (webinarData.firstLessonSlug) {
            router.push(`/w/${slug}/aula/${webinarData.firstLessonSlug}`)
            return
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Erro ao carregar")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, token, router])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    )
  }

  // Erro
  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Webinar não encontrado"}</p>
        </div>
      </div>
    )
  }

  // Mostrar tela de login/cadastro
  return (
    <LeadAuth
      webinarId={webinar.id}
      webinarSlug={webinar.slug}
      webinarName={webinar.name}
      webinarDescription={webinar.description}
      logoUrl={webinar.logoUrl}
      initialToken={token}
      onSuccess={(newLead) => {
        setLead(newLead)
        if (webinar.firstLessonSlug) {
          router.push(`/w/${slug}/aula/${webinar.firstLessonSlug}`)
        }
      }}
    />
  )
}
