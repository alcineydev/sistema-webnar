"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, Pencil, Trash2, Eye, Users, Video, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteWebinar } from "@/actions/webinar.actions"

interface Webinar {
  id: string
  name: string
  slug: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  createdAt: Date
  _count: {
    lessons: number
    leads: number
  }
}

interface WebinarListProps {
  webinars: Webinar[]
}

const statusMap = {
  DRAFT: { label: "Rascunho", variant: "secondary" as const },
  PUBLISHED: { label: "Publicado", variant: "default" as const },
  ARCHIVED: { label: "Arquivado", variant: "outline" as const },
}

export function WebinarList({ webinars }: WebinarListProps) {
  if (webinars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Video className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Nenhum webinar criado ainda</p>
          <Link href="/admin/webinars/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro webinar
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {webinars.map((webinar) => (
        <Card key={webinar.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                <Link href={`/admin/webinars/${webinar.id}`} className="hover:underline">
                  {webinar.name}
                </Link>
              </CardTitle>
              <CardDescription>
                /{webinar.slug} • Criado {formatDistanceToNow(new Date(webinar.createdAt), { addSuffix: true, locale: ptBR })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusMap[webinar.status].variant}>
                {statusMap[webinar.status].label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/webinars/${webinar.id}`}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/w/${webinar.slug}`} target="_blank">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={async () => {
                      if (confirm("Tem certeza que deseja excluir este webinar?")) {
                        await deleteWebinar(webinar.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                {webinar._count.lessons} aulas
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {webinar._count.leads} leads
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
