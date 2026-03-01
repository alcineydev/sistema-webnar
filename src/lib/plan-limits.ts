import type { PrismaClient as TenantPrismaClient } from ".prisma/tenant"
import { prismaMaster } from "@/lib/db/master"

interface PlanLimits {
  maxWebinars: number
  maxLessons: number
  maxLeadsMonth: number
  maxStorageGB: number
  maxUsers: number
  customDomain: boolean
  whiteLabel: boolean
  webhooks: boolean
  pixels: boolean
}

interface UsageStats {
  webinars: number
  leads: number
  users: number
  storage: number
}

interface LimitCheck {
  allowed: boolean
  current: number
  limit: number
  message?: string
}

export async function getTenantPlanLimits(tenantId: string): Promise<PlanLimits | null> {
  const subscription = await prismaMaster.subscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  })

  if (!subscription?.plan) return null

  return {
    maxWebinars: subscription.plan.maxWebinars,
    maxLessons: subscription.plan.maxLessons,
    maxLeadsMonth: subscription.plan.maxLeadsMonth,
    maxStorageGB: subscription.plan.maxStorageGB,
    maxUsers: subscription.plan.maxUsers,
    customDomain: subscription.plan.customDomain,
    whiteLabel: subscription.plan.whiteLabel,
    webhooks: subscription.plan.webhooks,
    pixels: subscription.plan.pixels,
  }
}

export async function getTenantUsage(
  tenantId: string,
  tenantPrisma: TenantPrismaClient
): Promise<UsageStats> {
  const webinars = await tenantPrisma.webinar.count()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const leads = await tenantPrisma.lead.count({
    where: {
      createdAt: { gte: startOfMonth },
    },
  })

  const users = await prismaMaster.user.count({
    where: { tenantId },
  })

  const storage = 0
  return { webinars, leads, users, storage }
}

export function checkLimit(current: number, limit: number, resourceName: string): LimitCheck {
  if (limit === -1) return { allowed: true, current, limit }

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `Limite de ${resourceName} atingido (${current}/${limit}). Faca upgrade do seu plano.`,
    }
  }

  return { allowed: true, current, limit }
}

export function formatLimit(value: number): string {
  return value === -1 ? "Ilimitado" : value.toLocaleString("pt-BR")
}

export function calculateUsagePercentage(current: number, limit: number): number {
  if (limit === -1) return 0
  if (limit <= 0) return 100
  return Math.min(100, Math.round((current / limit) * 100))
}

export async function hasPlanFeature(
  tenantId: string,
  feature: "customDomain" | "whiteLabel" | "webhooks" | "pixels"
): Promise<boolean> {
  const limits = await getTenantPlanLimits(tenantId)
  if (!limits) return false
  return Boolean(limits[feature])
}
