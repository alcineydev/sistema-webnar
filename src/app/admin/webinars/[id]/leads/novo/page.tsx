import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LeadForm } from "@/components/admin/lead-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function NovoLeadPage({ params }: Props) {
  const { id } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    select: { id: true, name: true }
  })

  if (!webinar) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Adicionar Lead</h1>
        <p className="text-slate-500">{webinar.name}</p>
      </div>

      <div className="max-w-lg">
        <LeadForm webinarId={id} />
      </div>
    </div>
  )
}
