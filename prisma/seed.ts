import bcrypt from "bcryptjs"
import { PrismaClient } from ".prisma/master"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  const hashedPassword = await bcrypt.hash("972058masteR@", 12)

  const superadmin = await prisma.user.upsert({
    where: { email: "sou.alcineynunes@gmail.com" },
    update: {
      name: "Alciney Nunes",
      role: "superadmin",
      password: hashedPassword,
    },
    create: {
      email: "sou.alcineynunes@gmail.com",
      password: hashedPassword,
      name: "Alciney Nunes",
      role: "superadmin",
    },
  })
  console.log("Super Admin ready:", superadmin.email)

  const plans = [
    {
      name: "Starter",
      slug: "starter",
      description: "Ideal para comecar",
      priceMonthly: 47.0,
      priceQuarterly: 127.0,
      priceYearly: 470.0,
      maxWebinars: 3,
      maxLessons: 15,
      maxLeadsMonth: 500,
      maxStorageGB: 2,
      maxUsers: 1,
      customDomain: false,
      whiteLabel: false,
      webhooks: false,
      pixels: true,
      prioritySupport: false,
      isPopular: false,
      sortOrder: 1,
    },
    {
      name: "Profissional",
      slug: "profissional",
      description: "Para quem quer crescer",
      priceMonthly: 97.0,
      priceQuarterly: 262.0,
      priceYearly: 970.0,
      maxWebinars: 10,
      maxLessons: 50,
      maxLeadsMonth: 5000,
      maxStorageGB: 10,
      maxUsers: 3,
      customDomain: true,
      whiteLabel: false,
      webhooks: true,
      pixels: true,
      prioritySupport: true,
      isPopular: true,
      sortOrder: 2,
    },
    {
      name: "Business",
      slug: "business",
      description: "Para grandes operacoes",
      priceMonthly: 197.0,
      priceQuarterly: 532.0,
      priceYearly: 1970.0,
      maxWebinars: -1,
      maxLessons: -1,
      maxLeadsMonth: -1,
      maxStorageGB: 50,
      maxUsers: 10,
      customDomain: true,
      whiteLabel: true,
      webhooks: true,
      pixels: true,
      prioritySupport: true,
      isPopular: false,
      sortOrder: 3,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
    console.log("Plan ready:", plan.name)
  }

  const pages = [
    {
      title: "Home",
      slug: "/",
      type: "home",
      status: "draft",
      metaTitle: "Webinar Hub - Crie Webinars Profissionais",
      metaDescription:
        "Plataforma completa para criar, hospedar e vender webinars online.",
    },
    {
      title: "Termos de Uso",
      slug: "termos",
      type: "terms",
      status: "draft",
      metaTitle: "Termos de Uso - Webinar Hub",
      metaDescription: null,
    },
    {
      title: "Politica de Privacidade",
      slug: "privacidade",
      type: "privacy",
      status: "draft",
      metaTitle: "Politica de Privacidade - Webinar Hub",
      metaDescription: null,
    },
    {
      title: "Pagina nao encontrada",
      slug: "404",
      type: "404",
      status: "published",
      metaTitle: "Pagina nao encontrada - Webinar Hub",
      metaDescription: null,
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    })
    console.log("Page ready:", page.title)
  }

  const settings = [
    { key: "siteName", value: "Webinar Hub" },
    { key: "siteDescription", value: "Plataforma de Webinars" },
    { key: "primaryColor", value: "#6366f1" },
    { key: "supportEmail", value: "suporte@webinarhub.com.br" },
  ]

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
    console.log("Setting ready:", setting.key)
  }

  console.log("Seed finished.")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
