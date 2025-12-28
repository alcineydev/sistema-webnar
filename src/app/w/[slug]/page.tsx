import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WebinarHeader } from "@/components/webinar/webinar-header"
import { LessonCard } from "@/components/webinar/lesson-card"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function WebinarPage({ params }: Props) {
  const { slug } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      lessons: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          videoDuration: true,
          thumbnailUrl: true,
          releaseAt: true,
          order: true,
        },
      },
    },
  })

  if (!webinar) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white dark:bg-black">
      <WebinarHeader
        webinarName={webinar.name}
        webinarSlug={webinar.slug}
        logoUrl={webinar.logoUrl}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {webinar.name}
            </h1>
            {webinar.description && (
              <p className="text-zinc-400 text-lg">{webinar.description}</p>
            )}
            <p className="text-zinc-500 mt-2">
              {webinar.lessons.length} aula{webinar.lessons.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Lista de aulas */}
          <div className="space-y-4">
            {webinar.lessons.map((lesson: typeof webinar.lessons[number], index: number) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                webinarSlug={webinar.slug}
                index={index}
                totalLessons={webinar.lessons.length}
              />
            ))}
          </div>

          {webinar.lessons.length === 0 && (
            <div className="text-center py-16">
              <p className="text-zinc-500">Nenhuma aula disponível ainda.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
