import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { WebinarForm } from "@/components/dashboard/webinar-form"
import { WebinarLessonsManager } from "@/components/dashboard/webinar-lessons-manager"

export const metadata: Metadata = {
  title: "Editar Webinar | Painel",
}

export const dynamic = "force-dynamic"

export default async function WebinarDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tenantContext = await resolveTenantByUserId(session.user.id)
  if (!tenantContext) redirect("/login")

  const webinar = await tenantContext.prisma.webinar.findUnique({
    where: { id: params.id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          videoUrl: true,
          order: true,
          isActive: true,
          offerUrl: true,
          offerButtonText: true,
          offerShowAt: true,
        },
      },
      _count: {
        select: { leads: true },
      },
    },
  })

  if (!webinar) notFound()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar Webinar</h1>
        <p className="text-slate-500">
          {webinar.name} · {webinar._count.leads} leads
        </p>
      </div>

      <WebinarForm
        webinar={{
          id: webinar.id,
          name: webinar.name,
          slug: webinar.slug,
          description: webinar.description,
          bannerUrl: webinar.bannerUrl,
          logoUrl: webinar.logoUrl,
          primaryColor: webinar.primaryColor,
          status: webinar.status,
        }}
      />

      <WebinarLessonsManager webinarId={webinar.id} lessons={webinar.lessons} />
    </div>
  )
}
