import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | Painel",
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
        Modulo de analytics em desenvolvimento.
      </div>
    </div>
  )
}
