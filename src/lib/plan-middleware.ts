import type { PrismaClient as TenantPrismaClient } from ".prisma/tenant"
import { checkLimit, getTenantPlanLimits, getTenantUsage } from "@/lib/plan-limits"

export async function requireTenantPlanFeature(
  tenantId: string,
  feature: "customDomain" | "whiteLabel" | "webhooks" | "pixels"
): Promise<void> {
  const limits = await getTenantPlanLimits(tenantId)
  if (!limits || !limits[feature]) {
    throw new Error(`Recurso '${feature}' indisponivel no plano atual`)
  }
}

export async function requireTenantResourceLimit(
  tenantId: string,
  tenantPrisma: TenantPrismaClient,
  resource: "webinars" | "leads" | "users" | "storage"
): Promise<void> {
  const [limits, usage] = await Promise.all([
    getTenantPlanLimits(tenantId),
    getTenantUsage(tenantId, tenantPrisma),
  ])

  if (!limits) {
    throw new Error("Plano nao encontrado")
  }

  const map = {
    webinars: { current: usage.webinars, limit: limits.maxWebinars, name: "webinars" },
    leads: { current: usage.leads, limit: limits.maxLeadsMonth, name: "leads por mes" },
    users: { current: usage.users, limit: limits.maxUsers, name: "usuarios" },
    storage: { current: usage.storage, limit: limits.maxStorageGB, name: "storage (GB)" },
  } as const

  const target = map[resource]
  const result = checkLimit(target.current, target.limit, target.name)
  if (!result.allowed) {
    throw new Error(result.message || "Limite do plano atingido")
  }
}
