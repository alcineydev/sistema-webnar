import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" asChild>
            <Link href="/">Voltar</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Usuários</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Webinars Ativos</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Inscrições Hoje</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Taxa de Conversão</h3>
            <p className="text-3xl font-bold">0%</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="flex gap-4">
            <Button>Criar Webinar</Button>
            <Button variant="outline">Gerenciar Usuários</Button>
            <Button variant="outline">Configurações</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
