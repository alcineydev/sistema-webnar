import { ThemeProvider } from "@/components/providers/theme-provider"

export default function WebinarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-white">
        {children}
      </div>
    </ThemeProvider>
  )
}
