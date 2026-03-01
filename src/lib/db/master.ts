import { PrismaClient } from ".prisma/master"

const globalForPrisma = globalThis as unknown as {
  prismaMaster: PrismaClient | undefined
}

export const prismaMaster =
  globalForPrisma.prismaMaster ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaMaster = prismaMaster
}

export default prismaMaster
