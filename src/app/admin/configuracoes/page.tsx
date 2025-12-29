import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Bell, Shield, Palette } from "lucide-react"

export default function ConfiguracoesGlobalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Configurações gerais da plataforma</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Perfil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <CardTitle>Perfil</CardTitle>
            </div>
            <CardDescription>Informações do administrador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Seu nome" defaultValue="Administrador" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@exemplo.com" defaultValue="admin@webinar.com" disabled />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-400" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configure suas notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novos leads</p>
                <p className="text-sm text-slate-500">Receba um email quando um novo lead se cadastrar</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conversões</p>
                <p className="text-sm text-slate-500">Receba um email quando um lead clicar na oferta</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-400" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>Personalize a aparência padrão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cor Principal</Label>
              <div className="flex gap-2">
                <Input type="color" defaultValue="#6366f1" className="w-16 h-10 p-1" />
                <Input defaultValue="#6366f1" className="font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>Configurações de segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alterar Senha</Label>
              <Input type="password" placeholder="Nova senha" />
            </div>
            <div className="space-y-2">
              <Input type="password" placeholder="Confirmar nova senha" />
            </div>
            <Button variant="outline">Alterar Senha</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
