import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ThemeProvider } from "@/components/theme-provider"

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

  const metadata: Metadata = {
    title: webinar?.name || "Webinar",
    description: webinar?.description || "",
  }

  if (webinar?.faviconUrl) {
    metadata.icons = {
      icon: [
        { url: webinar.faviconUrl },
        { url: webinar.faviconUrl, sizes: "32x32", type: "image/png" },
      ],
      shortcut: webinar.faviconUrl,
      apple: webinar.faviconUrl,
    }
  }

  return metadata
}

export default function WebinarLayout({ children }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}
