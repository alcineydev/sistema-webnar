import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isLoginPage = nextUrl.pathname === "/admin/login"
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")

  // Permitir rotas de API de autenticação
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Se está na página de login e já está logado, redireciona para admin
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", nextUrl))
  }

  // Se está em rota admin (exceto login) e não está logado, redireciona para login
  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
