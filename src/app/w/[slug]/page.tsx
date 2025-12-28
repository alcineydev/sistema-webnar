import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

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
        take: 1,
        select: { slug: true },
      },
    },
  })

  if (!webinar) {
    notFound()
  }

  if (webinar.lessons.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Nenhuma aula disponível</h1>
          <p className="text-zinc-400">Este webinar ainda não possui aulas publicadas.</p>
        </div>
      </div>
    )
  }

  // Redireciona para a primeira aula
  redirect(`/w/${slug}/aula/${webinar.lessons[0].slug}`)
}
