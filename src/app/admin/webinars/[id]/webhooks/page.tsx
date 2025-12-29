import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { WebhookCopyButton } from "@/components/admin/webhook-copy-button"

interface Props {
  params: Promise<{ id: string }>
}

export default async function WebinarWebhooksPage({ params }: Props) {
  const { id } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      n8nWebhookUrl: true
    }
  })

  if (!webinar) {
    notFound()
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://sistema-webnar.vercel.app"}/api/webhook/lead`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Webhooks</h1>
        <p className="text-slate-500">{webinar.name}</p>
      </div>

      {/* Webhook para receber leads */}
      <Card>
        <CardHeader>
          <CardTitle>Receber Leads (N8N → Sistema)</CardTitle>
          <CardDescription>
            Use esta URL no seu N8N ou outra ferramenta para enviar leads automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">URL do Webhook</label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <WebhookCopyButton text={webhookUrl} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Slug do Webinar</label>
            <div className="flex gap-2">
              <Input
                value={webinar.slug}
                readOnly
                className="font-mono text-sm max-w-xs"
              />
              <WebhookCopyButton text={webinar.slug} />
            </div>
            <p className="text-xs text-slate-500 mt-1">Use este valor no campo &quot;webinarSlug&quot; do JSON</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Exemplo de JSON (POST)</p>
            <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto">
{`{
  "email": "lead@exemplo.com",
  "name": "Nome do Lead",
  "phone": "11999999999",
  "webinarSlug": "${webinar.slug}",
  "utmSource": "facebook",
  "utmMedium": "cpc",
  "utmCampaign": "lancamento"
}`}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-1">Resposta do Webhook</p>
            <p className="text-xs text-blue-700">
              O webhook retorna uma <code className="bg-blue-100 px-1 rounded">accessUrl</code> que você pode enviar por email para o lead acessar diretamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhook para enviar eventos (N8N) */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Eventos (Sistema → N8N)</CardTitle>
          <CardDescription>
            Configure a URL do seu workflow N8N para receber eventos deste webinar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">URL do Webhook N8N</label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://seu-n8n.com/webhook/xxx"
                defaultValue={webinar.n8nWebhookUrl || ""}
                disabled
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Configure nas configurações do webinar</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Eventos Enviados</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• LEAD_REGISTERED - Novo lead cadastrado</li>
              <li>• VIDEO_COMPLETED - Lead completou uma aula</li>
              <li>• OFFER_CLICKED - Lead clicou na oferta</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
