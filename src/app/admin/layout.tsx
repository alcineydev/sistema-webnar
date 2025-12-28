import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Sistema Webinar',
  description: 'Painel administrativo do Sistema Webinar',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
