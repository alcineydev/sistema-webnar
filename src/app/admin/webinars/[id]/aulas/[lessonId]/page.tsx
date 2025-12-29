import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LessonForm } from "@/components/admin/lesson-form"

interface Props {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function EditarAulaPage({ params }: Props) {
  const { id, lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, webinarId: id }
  })

  if (!lesson) {
    notFound()
  }

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    select: { name: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar Aula</h1>
        <p className="text-slate-500">{webinar?.name}</p>
      </div>

      <div className="max-w-2xl">
        <LessonForm webinarId={id} lesson={lesson} />
      </div>
    </div>
  )
}
