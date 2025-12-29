import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WebinarTabs } from "@/components/admin/webinar-tabs"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function WebinarLayout({ children, params }: Props) {
  const { id } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, status: true }
  })

  if (!webinar) {
    notFound()
  }

  return (
    <div>
      {/* Header do webinar */}
      <div className="bg-white border-b border-slate-200 -mx-6 -mt-6 px-6 py-4 mb-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/webinars"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{webinar.name}</h1>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                webinar.status === "PUBLISHED"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {webinar.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
              </span>
            </div>
            <p className="text-sm text-slate-500">/{webinar.slug}</p>
          </div>
          <Link
            href={`/w/${webinar.slug}`}
            target="_blank"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Ver página →
          </Link>
        </div>
      </div>

      {/* Tabs de navegação */}
      <WebinarTabs webinarId={id} />

      {/* Conteúdo */}
      {children}
    </div>
  )
}
