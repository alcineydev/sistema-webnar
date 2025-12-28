import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LessonForm } from "@/components/admin/lesson-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function NewLessonPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/webinars/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Aula</h1>
          <p className="text-slate-500">Adicione uma nova aula ao webinar</p>
        </div>
      </div>

      <LessonForm webinarId={id} />
    </div>
  )
}
