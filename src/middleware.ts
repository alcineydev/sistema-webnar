import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  if (isLoggedIn && nextUrl.pathname === "/login") {
    const role = req.auth?.user?.role

    if (role === "superadmin") {
      return NextResponse.redirect(new URL("/superadmin", nextUrl))
    }

    return NextResponse.redirect(new URL("/painel", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
