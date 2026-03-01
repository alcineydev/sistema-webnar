import { PrismaClient } from ".prisma/tenant"

const tenantConnections = new Map<string, PrismaClient>()

/**
 * Retorna uma instancia do Prisma Client para o tenant especificado.
 */
export function getTenantPrisma(
  databaseUrl: string,
  tenantId: string
): PrismaClient {
  if (tenantConnections.has(tenantId)) {
    return tenantConnections.get(tenantId)!
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

  tenantConnections.set(tenantId, prisma)

  return prisma
}

/**
 * Limpa a conexao de um tenant no cache.
 */
export async function disconnectTenant(tenantId: string): Promise<void> {
  const prisma = tenantConnections.get(tenantId)
  if (prisma) {
    await prisma.$disconnect()
    tenantConnections.delete(tenantId)
  }
}

/**
 * Limpa todas as conexoes em cache.
 */
export async function disconnectAllTenants(): Promise<void> {
  for (const [tenantId, prisma] of Array.from(tenantConnections.entries())) {
    await prisma.$disconnect()
    tenantConnections.delete(tenantId)
  }
}
