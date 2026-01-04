import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/admin/sidebar"

export const dynamic = "force-dynamic"

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
    }
  }

  return metadata
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
