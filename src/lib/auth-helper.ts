import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"

export async function getServerSession() {
  const cookieStore = await cookies()

  const sessionToken =
    cookieStore.get("__Secure-next-auth.session-token")?.value ||
    cookieStore.get("next-auth.session-token")?.value

  if (!sessionToken) {
    console.log("[auth-helper] No session token found")
    return null
  }

  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""

    const decoded = await decode({
      token: sessionToken,
      secret: secret,
      salt: cookieStore.get("__Secure-next-auth.session-token")?.value
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
    })

    if (!decoded) {
      console.log("[auth-helper] Failed to decode token")
      return null
    }

    console.log("[auth-helper] Session decoded successfully:", decoded.email)

    return {
      user: {
        id: (decoded.id as string) || (decoded.sub as string),
        email: decoded.email as string,
        name: decoded.name as string,
        role: decoded.role as string,
      },
    }
  } catch (error) {
    console.error("[auth-helper] Error decoding session:", error)
    return null
  }
}
