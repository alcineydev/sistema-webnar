import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WebinarHeader } from "@/components/webinar/webinar-header"
import { LessonCard } from "@/components/webinar/lesson-card"

interface Lesson {
  id: string
  title: string
  slug: string
  description: string | null
  duration: number | null
  order: number
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function WebinarLessonsPage({ params }: PageProps) {
  const { slug } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          duration: true,
          order: true,
        },
      },
    },
  })

  if (!webinar) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <WebinarHeader webinarName={webinar.name} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">{webinar.name}</h2>
          {webinar.description && (
            <p className="mt-2 text-slate-400">{webinar.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
            <span>{webinar.lessons.length} aulas</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {webinar.lessons.map((lesson: Lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              webinarSlug={slug}
            />
          ))}
        </div>

        {webinar.lessons.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">Nenhuma aula disponível ainda.</p>
          </div>
        )}
      </main>
    </div>
  )
}
