import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const webinar = await prisma.webinar.findUnique({
    where: { slug },
    select: {
      name: true,
      faviconUrl: true,
      description: true
    }
  })

  return {
    title: webinar?.name || "Webinar",
    description: webinar?.description || "",
    icons: webinar?.faviconUrl ? {
      icon: webinar.faviconUrl,
      shortcut: webinar.faviconUrl,
      apple: webinar.faviconUrl,
    } : undefined
  }
}

export default function WebinarLayout({ children }: Props) {
  return children
}
