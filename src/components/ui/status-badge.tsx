interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "error" | "info"
}

const variants = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
}

const statusVariants: Record<string, keyof typeof variants> = {
  active: "success",
  suspended: "warning",
  cancelled: "error",
  overdue: "warning",
  pending: "info",
  confirmed: "success",
  draft: "default",
  published: "success",
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const variantKey = variant || statusVariants[normalized] || "default"

  const labels: Record<string, string> = {
    active: "Ativo",
    suspended: "Suspenso",
    cancelled: "Cancelado",
    overdue: "Inadimplente",
    pending: "Pendente",
    confirmed: "Confirmado",
    draft: "Rascunho",
    published: "Publicado",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variantKey]}`}
    >
      {labels[normalized] || status}
    </span>
  )
}
