import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWebinars } from "@/actions/webinar.actions"
import { WebinarList } from "@/components/admin/webinar-list"

export default async function WebinarsPage() {
  const webinars = await getWebinars()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Webinars</h1>
          <p className="text-slate-500">Gerencie seus webinars e aulas</p>
        </div>
        <Link href="/admin/webinars/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Webinar
          </Button>
        </Link>
      </div>

      <WebinarList webinars={webinars} />
    </div>
  )
}
