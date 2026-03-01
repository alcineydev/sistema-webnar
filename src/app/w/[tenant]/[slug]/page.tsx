import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { resolveTenantBySlug } from "@/lib/db/resolve-tenant"
import { LeadCapture } from "@/components/webinar/lead-capture"
import { WebinarPlayer } from "@/components/webinar/webinar-player"

interface Props {
  params: { tenant: string; slug: string }
}

async function getPublishedWebinar(tenantSlug: string, webinarSlug: string) {
  const tenantContext = await resolveTenantBySlug(tenantSlug)
  if (!tenantContext) return null

  const webinar = await tenantContext.prisma.webinar.findUnique({
    where: { slug: webinarSlug },
    include: {
      lessons: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!webinar || webinar.status !== "PUBLISHED") {
    return null
  }

  return { tenantContext, webinar }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const payload = await getPublishedWebinar(params.tenant, params.slug)
  if (!payload) return { title: "Nao encontrado" }

  const { webinar } = payload
  return {
    title: webinar.name,
    description: webinar.description || undefined,
  }
}

export default async function WebinarPage({ params }: Props) {
  const payload = await getPublishedWebinar(params.tenant, params.slug)
  if (!payload) notFound()

  const { tenantContext, webinar } = payload

  const cookieStore = cookies()
  const cookieKey = `lead_${params.tenant}_${params.slug}`
  const leadCookie = cookieStore.get(cookieKey)?.value

  let lead = null
  if (leadCookie) {
    lead = await tenantContext.prisma.lead.findFirst({
      where: {
        id: leadCookie,
        webinarId: webinar.id,
      },
      include: {
        progress: true,
      },
    })
  }

  if (!lead) {
    return <LeadCapture webinar={webinar} tenant={tenantContext.tenant} />
  }

  return <WebinarPlayer webinar={webinar} lead={lead} tenant={tenantContext.tenant} />
}
