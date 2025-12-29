import { notFound } from "next/navigation"
import { getWebinarById } from "@/actions/webinar.actions"
import { LessonForm } from "@/components/admin/lesson-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function NovaAulaPage({ params }: Props) {
  const { id } = await params
  const webinar = await getWebinarById(id)

  if (!webinar) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nova Aula</h1>
        <p className="text-slate-500">{webinar.name}</p>
      </div>

      <div className="max-w-2xl">
        <LessonForm webinarId={id} />
      </div>
    </div>
  )
}
