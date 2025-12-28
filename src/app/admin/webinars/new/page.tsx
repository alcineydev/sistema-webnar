import { WebinarForm } from "@/components/admin/webinar-form"

export default function NewWebinarPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Novo Webinar</h1>
        <p className="text-slate-500">Preencha os dados do seu webinar</p>
      </div>

      <WebinarForm />
    </div>
  )
}
