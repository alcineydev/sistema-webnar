import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WebinarForm } from "@/components/admin/webinar-form"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function WebinarConfiguracoesPage({ params }: Props) {
  const { id } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { id }
  })

  if (!webinar) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">{webinar.name}</p>
      </div>

      <div className="max-w-2xl">
        <WebinarForm webinar={webinar} />
      </div>
    </div>
  )
}
