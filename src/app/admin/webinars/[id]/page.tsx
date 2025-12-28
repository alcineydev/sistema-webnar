import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getWebinarById } from "@/actions/webinar.actions"
import { WebinarForm } from "@/components/admin/webinar-form"
import { LessonList } from "@/components/admin/lesson-list"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditWebinarPage({ params }: Props) {
  const { id } = await params
  const webinar = await getWebinarById(id)

  if (!webinar) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/webinars">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{webinar.name}</h1>
          <p className="text-slate-500">/{webinar.slug} • {webinar._count.leads} leads</p>
        </div>
      </div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">Aulas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/admin/webinars/${webinar.id}/lessons/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Aula
              </Button>
            </Link>
          </div>
          <LessonList lessons={webinar.lessons} webinarId={webinar.id} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="max-w-2xl">
            <WebinarForm webinar={webinar} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
