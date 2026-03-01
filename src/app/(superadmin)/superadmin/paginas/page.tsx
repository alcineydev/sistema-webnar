import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { prismaMaster } from "@/lib/db/master"
import { Button } from "@/components/ui/button"
import { PagesList } from "@/components/superadmin/pages-list"

export const metadata: Metadata = {
  title: "Paginas | Super Admin",
}

export const dynamic = "force-dynamic"

async function getPages() {
  return prismaMaster.page.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export default async function PagesPage() {
  const pages = await getPages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paginas</h1>
          <p className="text-slate-500">Gerencie as paginas publicas do site</p>
        </div>
        <Link href="/superadmin/paginas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Pagina
          </Button>
        </Link>
      </div>

      <PagesList pages={pages} />
    </div>
  )
}
