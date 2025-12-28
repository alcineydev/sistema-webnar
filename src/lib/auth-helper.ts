import { cookies } from "next/headers"
import { jwtVerify } from "jose"

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
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""
    const encodedSecret = new TextEncoder().encode(secret)

    const { payload } = await jwtVerify(sessionToken, encodedSecret)

    if (!payload) {
      return null
    }

    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as string,
      }
    }
  } catch (error) {
    console.error("Error decoding session:", error)
    return null
  }
}
