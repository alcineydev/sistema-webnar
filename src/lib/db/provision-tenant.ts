import { exec } from "child_process"
import path from "path"
import { promisify } from "util"
import { prismaMaster } from "./master"

const execAsync = promisify(exec)

interface ProvisionResult {
  success: boolean
  databaseUrl?: string
  databaseName?: string
  error?: string
}

/**
 * Provisiona um banco dedicado para o tenant.
 * Para ambiente local/staging, pode nao existir permissao para criacao fisica do banco.
 */
export async function provisionTenantDatabase(
  tenantId: string,
  tenantSlug: string
): Promise<ProvisionResult> {
  try {
    const masterUrl = process.env.DATABASE_URL
    if (!masterUrl) {
      throw new Error("DATABASE_URL nao configurada")
    }

    const baseUrl = new URL(masterUrl)
    const databaseName = `tenant_${tenantSlug.replace(/-/g, "_")}`
    baseUrl.pathname = `/${databaseName}`
    const tenantDatabaseUrl = baseUrl.toString()

    try {
      const tenantSchemaPath = path.join(process.cwd(), "prisma/tenant/schema.prisma")
      await execAsync(`npx prisma db push --schema="${tenantSchemaPath}" --accept-data-loss`, {
        env: {
          ...process.env,
          DATABASE_URL: tenantDatabaseUrl,
          TENANT_DATABASE_URL: tenantDatabaseUrl,
        },
      })
    } catch (error) {
      // Mantem o fluxo para permitir ambientes onde o banco ja foi provisionado externamente.
      console.error("[Provision] Aviso ao aplicar schema do tenant:", error)
    }

    await prismaMaster.tenant.update({
      where: { id: tenantId },
      data: {
        databaseUrl: tenantDatabaseUrl,
        databaseName,
      },
    })

    return {
      success: true,
      databaseUrl: tenantDatabaseUrl,
      databaseName,
    }
  } catch (error) {
    console.error("[Provision] Erro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

/**
 * Valida conexao de banco do tenant.
 */
export async function checkTenantDatabase(tenantId: string): Promise<boolean> {
  try {
    const tenant = await prismaMaster.tenant.findUnique({
      where: { id: tenantId },
      select: { databaseUrl: true },
    })
    if (!tenant?.databaseUrl) return false

    const { getTenantPrisma } = await import("./tenant")
    const prisma = getTenantPrisma(tenant.databaseUrl, tenantId)
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

/**
 * Modo simplificado para desenvolvimento: utiliza o mesmo banco do master.
 */
export async function provisionTenantSchema(
  tenantId: string,
  tenantSlug: string
): Promise<ProvisionResult> {
  try {
    void tenantSlug
    const masterUrl = process.env.DATABASE_URL
    if (!masterUrl) {
      throw new Error("DATABASE_URL nao configurada")
    }

    await prismaMaster.tenant.update({
      where: { id: tenantId },
      data: {
        databaseUrl: masterUrl,
        databaseName: "shared",
      },
    })

    return {
      success: true,
      databaseUrl: masterUrl,
      databaseName: "shared",
    }
  } catch (error) {
    console.error("[Provision Schema] Erro:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}
