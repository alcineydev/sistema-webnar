import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ajuda | Painel",
}

export default function AjudaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Central de Ajuda</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
        Conteudo de ajuda em desenvolvimento.
      </div>
    </div>
  )
}
