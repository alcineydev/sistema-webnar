import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolveTenantByUserId } from "@/lib/db/resolve-tenant"
import { Button } from "@/components/ui/button"
import { WebinarsList } from "@/components/dashboard/webinars-list"

export const metadata: Metadata = {
  title: "Webinars | Painel",
}

export const dynamic = "force-dynamic"

export default async function WebinarsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tenantContext = await resolveTenantByUserId(session.user.id)
  if (!tenantContext) redirect("/login")

  const webinars = await tenantContext.prisma.webinar.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          lessons: true,
          leads: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Webinars</h1>
          <p className="text-slate-500">Gerencie seus webinars e cursos</p>
        </div>
        <Link href="/painel/webinars/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Webinar
          </Button>
        </Link>
      </div>

      <WebinarsList webinars={webinars} tenantSlug={tenantContext.tenant.slug} />
    </div>
  )
}
