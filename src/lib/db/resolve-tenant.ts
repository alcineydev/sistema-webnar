import { PrismaClient } from ".prisma/tenant"
import { prismaMaster } from "./master"
import { getTenantPrisma } from "./tenant"

interface TenantContext {
  tenant: {
    id: string
    name: string
    slug: string
    databaseUrl: string
    status: string
    logoUrl: string | null
    faviconUrl: string | null
    primaryColor: string | null
    customDomain: string | null
  }
  prisma: PrismaClient
}

/**
 * Resolve o tenant pelo slug e retorna contexto com Prisma Client.
 */
export async function resolveTenantBySlug(
  slug: string
): Promise<TenantContext | null> {
  const tenant = await prismaMaster.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      databaseUrl: true,
      status: true,
      logoUrl: true,
      faviconUrl: true,
      primaryColor: true,
      customDomain: true,
    },
  })

  if (!tenant || !tenant.databaseUrl) {
    return null
  }

  if (tenant.status !== "active") {
    return null
  }

  const prisma = getTenantPrisma(tenant.databaseUrl, tenant.id)

  return {
    tenant: {
      ...tenant,
      databaseUrl: tenant.databaseUrl,
    },
    prisma,
  }
}

/**
 * Resolve o tenant pelo ID do usuario autenticado.
 */
export async function resolveTenantByUserId(
  userId: string
): Promise<TenantContext | null> {
  const user = await prismaMaster.user.findUnique({
    where: { id: userId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          databaseUrl: true,
          status: true,
          logoUrl: true,
          faviconUrl: true,
          primaryColor: true,
          customDomain: true,
        },
      },
    },
  })

  if (!user?.tenant || !user.tenant.databaseUrl) {
    return null
  }

  const prisma = getTenantPrisma(user.tenant.databaseUrl, user.tenant.id)

  return {
    tenant: {
      ...user.tenant,
      databaseUrl: user.tenant.databaseUrl,
    },
    prisma,
  }
}
