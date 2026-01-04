import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = null

  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "adminFaviconUrl" }
    })
    faviconUrl = setting?.value
  } catch {
    // Tabela pode não existir ainda
  }

  const metadata: Metadata = {
    title: "Admin | Sistema Webinar",
  }

  if (faviconUrl) {
    metadata.icons = {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    }
  }

  return metadata
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
