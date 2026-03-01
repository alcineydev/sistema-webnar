import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { prismaMaster } from "@/lib/db/master"
import { Button } from "@/components/ui/button"
import { TenantDetails } from "@/components/superadmin/tenant-details"

export const metadata: Metadata = {
  title: "Detalhes do Cliente | Super Admin",
}

export const dynamic = "force-dynamic"

async function getTenant(id: string) {
  return prismaMaster.tenant.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      subscription: {
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
    },
  })
}

export default async function TenantDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const tenant = await getTenant(params.id)

  if (!tenant) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/clientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
          <p className="text-slate-500">{tenant.email}</p>
        </div>
      </div>

      <TenantDetails tenant={tenant} />
    </div>
  )
}
