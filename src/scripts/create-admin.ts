import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@webinar.com"
  const password = "admin123"
  const name = "Administrador"

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("✅ Admin criado com sucesso!")
  console.log("📧 Email:", email)
  console.log("🔑 Senha:", password)
  console.log("👤 ID:", user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
