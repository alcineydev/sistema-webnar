import type { Metadata } from "next"
import { WebinarForm } from "@/components/dashboard/webinar-form"

export const metadata: Metadata = {
  title: "Novo Webinar | Painel",
}

export default function NewWebinarPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Novo Webinar</h1>
        <p className="text-slate-500">Crie um novo webinar ou curso</p>
      </div>

      <WebinarForm />
    </div>
  )
}
