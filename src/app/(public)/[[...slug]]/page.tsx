import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prismaMaster } from "@/lib/db/master"
import { DynamicPage } from "@/components/public/dynamic-page"

interface Props {
  params: { slug?: string[] }
}

function getJoinedSlug(params: Props["params"]) {
  const value = params.slug?.join("/") || "/"
  if (!value) return "/"
  return value
}

async function getPage(slug: string) {
  return prismaMaster.page.findFirst({
    where: {
      slug,
      status: "published",
    },
  })
}

async function getPlans() {
  return prismaMaster.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = getJoinedSlug(params)
  const page = await getPage(slug)

  if (!page) {
    return { title: "Pagina nao encontrada" }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  }
}

export default async function PublicPage({ params }: Props) {
  const slug = getJoinedSlug(params)

  const ignoredPaths = ["api", "admin", "superadmin", "painel", "w", "login", "registro"]
  if (params.slug?.[0] && ignoredPaths.includes(params.slug[0])) {
    notFound()
  }

  const page = await getPage(slug)

  if (!page) {
    const page404 = await getPage("404")
    if (page404) {
      return <DynamicPage page={page404} plans={[]} />
    }
    notFound()
  }

  const plans = page.type === "home" ? await getPlans() : []
  return <DynamicPage page={page} plans={plans} />
}
