import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const { pathname, origin } = request.nextUrl

  // Keep legacy URL /admin/login but serve a public route outside /admin layout.
  if (pathname === "/admin/login") {
    return NextResponse.rewrite(new URL("/auth/admin-login", origin))
  }

  if (pathname.startsWith("/admin") && !request.auth?.user) {
    return NextResponse.redirect(new URL("/admin/login", origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
