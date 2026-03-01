import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Entrar | Webinar Hub",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Webinar Hub</h1>
          </Link>
          <p className="mt-2 text-slate-500">Acesse sua conta</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-slate-500">
            Nao tem conta?{" "}
            <Link href="/registro" className="font-medium text-indigo-600 hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
