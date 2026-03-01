import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prismaMaster } from "@/lib/db/master"
import { PageBuilder } from "@/components/superadmin/page-builder"

export const metadata: Metadata = {
  title: "Editor de Pagina | Super Admin",
}

export const dynamic = "force-dynamic"

async function getPage(id: string) {
  if (id === "nova") {
    return {
      id: null,
      title: "",
      slug: "",
      type: "normal",
      status: "draft",
      htmlContent: "",
      cssContent: "",
      jsContent: "",
      metaTitle: "",
      metaDescription: "",
    }
  }

  return prismaMaster.page.findUnique({
    where: { id },
  })
}

export default async function PageEditorPage({
  params,
}: {
  params: { id: string }
}) {
  const page = await getPage(params.id)

  if (!page && params.id !== "nova") {
    notFound()
  }

  return <PageBuilder page={page} isNew={params.id === "nova"} />
}
