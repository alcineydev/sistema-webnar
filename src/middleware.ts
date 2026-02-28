import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((request) => {
  const { pathname } = request.nextUrl

  // Never redirect login to itself.
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin") && !request.auth?.user) {
    const loginUrl = new URL("/admin/login", request.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
