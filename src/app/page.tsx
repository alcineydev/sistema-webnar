import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Sistema Webinar</h1>
        <p className="text-muted-foreground text-lg">
          Sistema profissional de webinar com área de membros
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/admin">Acessar Admin</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
