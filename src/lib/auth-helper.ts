import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"

export async function getServerSession() {
  const cookieStore = await cookies()

  // Tenta diferentes nomes de cookie (secure e não-secure)
  const sessionToken =
    cookieStore.get("__Secure-next-auth.session-token")?.value ||
    cookieStore.get("next-auth.session-token")?.value

  if (!sessionToken) {
    return null
  }

  try {
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
    })

    if (!decoded) {
      return null
    }

    return {
      user: {
        id: decoded.id as string,
        email: decoded.email as string,
        name: decoded.name as string,
        role: decoded.role as string,
      }
    }
  } catch (error) {
    console.error("Error decoding session:", error)
    return null
  }
}
