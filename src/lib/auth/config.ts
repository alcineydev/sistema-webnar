import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const isPublicApi =
        pathname.startsWith("/api/public") || pathname.startsWith("/api/webhook")
      if (isPublicApi) return true

      const isSuperAdminArea = pathname.startsWith("/superadmin")
      const isDashboardArea = pathname.startsWith("/painel")
      const isProtectedArea = isSuperAdminArea || isDashboardArea
      if (!isProtectedArea) return true
      if (!isLoggedIn) return false

      if (isSuperAdminArea) {
        return auth?.user?.role === "superadmin"
      }

      if (isDashboardArea) {
        return ["admin", "collaborator"].includes(auth?.user?.role || "")
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = (token.tenantId as string | null) ?? null
      }
      return session
    },
  },
  providers: [],
}
