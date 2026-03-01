import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leads | Painel",
}

export default function LeadsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
        Modulo de leads em desenvolvimento.
      </div>
    </div>
  )
}
