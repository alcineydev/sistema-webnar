"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Video, Users, TrendingUp, Eye, ArrowUpRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Webinar {
  id: string
  name: string
  status: string
  _count: { lessons: number; leads: number }
}

interface DashboardData {
  webinarCount: number
  leadCount: number
  todayLeads: number
  conversionRate: string
  webinars: Webinar[]
}

export function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/dashboard")
        .then(res => res.json())
        .then(setData)
        .finally(() => setLoading(false))
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const stats = [
    { title: "Total de Leads", value: data?.leadCount || 0, icon: Users, color: "bg-blue-500" },
    { title: "Webinars Ativos", value: data?.webinarCount || 0, icon: Video, color: "bg-indigo-500" },
    { title: "Inscrições Hoje", value: data?.todayLeads || 0, icon: Eye, color: "bg-green-500" },
    { title: "Conversão", value: data?.conversionRate || "0%", icon: TrendingUp, color: "bg-purple-500" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Olá, {session.user?.name || "Admin"} 👋</h2>
          <p className="text-slate-500">Resumo do seu sistema de webinars</p>
        </div>
        <Link href="/admin/webinars/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />Novo Webinar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={`rounded-lg ${stat.color} p-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Webinars Recentes</CardTitle>
          <Link href="/admin/webinars">
            <Button variant="ghost" size="sm">Ver todos<ArrowUpRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!data?.webinars?.length ? (
            <div className="text-center py-12">
              <Video className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">Nenhum webinar criado</p>
              <Link href="/admin/webinars/new">
                <Button variant="outline" className="mt-4"><Plus className="mr-2 h-4 w-4" />Criar webinar</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {data.webinars.map((w) => (
                <Link key={w.id} href={`/admin/webinars/${w.id}`} className="flex items-center justify-between py-4 hover:bg-slate-50 -mx-4 px-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <Video className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{w.name}</p>
                      <p className="text-sm text-slate-500">{w._count.lessons} aulas • {w._count.leads} leads</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${w.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {w.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
