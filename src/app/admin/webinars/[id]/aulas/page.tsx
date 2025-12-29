import { notFound } from "next/navigation"
import { getWebinarById } from "@/actions/webinar.actions"
import { LessonList } from "@/components/admin/lesson-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function WebinarAulasPage({ params }: Props) {
  const { id } = await params
  const webinar = await getWebinarById(id)

  if (!webinar) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Aulas</h1>
          <p className="text-slate-500">{webinar.name}</p>
        </div>
        <Link href={`/admin/webinars/${id}/aulas/nova`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </Button>
        </Link>
      </div>

      <LessonList lessons={webinar.lessons} webinarId={id} />
    </div>
  )
}
