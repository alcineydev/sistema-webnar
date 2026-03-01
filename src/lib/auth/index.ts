import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prismaMaster } from "@/lib/db/master"
import { authConfig } from "./config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prismaMaster.user.findUnique({
          where: { email },
          include: {
            tenant: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        })

        if (!user) {
          return null
        }

        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
          return null
        }

        if (user.role !== "superadmin" && user.tenant?.status !== "active") {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
    }),
  ],
})
