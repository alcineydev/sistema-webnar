import type { Metadata } from "next"
import { PageBuilder } from "@/components/superadmin/page-builder"

export const metadata: Metadata = {
  title: "Nova Pagina | Super Admin",
}

export default function NewPagePage() {
  const emptyPage = {
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

  return <PageBuilder page={emptyPage} isNew />
}
