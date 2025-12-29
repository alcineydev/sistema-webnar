"use client"

import { useState, useEffect } from "react"
import { Loader2, Mail, Phone, User, ArrowRight, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LeadAuthProps {
  webinarId: string
  webinarSlug: string
  webinarName: string
  webinarDescription?: string | null
  logoUrl?: string | null
  onSuccess: (lead: { id: string; email: string; name: string }) => void
  initialToken?: string | null
}

type AuthMode = "login" | "register"

export function LeadAuth({
  webinarId: _webinarId,
  webinarSlug,
  webinarName,
  webinarDescription,
  logoUrl,
  onSuccess,
  initialToken
}: LeadAuthProps) {
  // _webinarId mantido na interface para uso futuro
  void _webinarId
  const [mode, setMode] = useState<AuthMode>("login")
  const [identifier, setIdentifier] = useState("") // email ou telefone
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingToken, setCheckingToken] = useState(!!initialToken)

  // Verificar token automaticamente
  useEffect(() => {
    if (initialToken) {
      handleTokenLogin(initialToken)
    }
  }, [initialToken])

  async function handleTokenLogin(token: string) {
    setLoading(true)
    setCheckingToken(true)
    try {
      const response = await fetch("/api/lead/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, webinarSlug })
      })

      const data = await response.json()

      if (response.ok && data.lead) {
        onSuccess(data.lead)
      }
    } catch (err) {
      console.error("Token login error:", err)
    } finally {
      setLoading(false)
      setCheckingToken(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!identifier) {
      setError("Digite seu email ou telefone")
      return
    }

    setLoading(true)

    try {
      const isEmail = identifier.includes("@")

      const response = await fetch("/api/lead/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [isEmail ? "email" : "phone"]: identifier,
          webinarSlug
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.notFound) {
          setError("Não encontramos seu cadastro. Deseja se registrar?")
          return
        }
        throw new Error(data.error)
      }

      onSuccess(data.lead)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!identifier) {
      setError("Digite seu email")
      return
    }

    // Validar email
    if (!identifier.includes("@")) {
      setError("Digite um email válido")
      return
    }

    setLoading(true)

    try {
      // Capturar UTMs
      const params = new URLSearchParams(window.location.search)

      const response = await fetch("/api/lead/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier,
          name: name || undefined,
          phone: phone || undefined,
          webinarSlug,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign")
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.alreadyExists) {
          setMode("login")
          setError("Email já cadastrado. Faça login abaixo.")
          return
        }
        throw new Error(data.error)
      }

      onSuccess(data.lead)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  // Loading inicial (verificando token)
  if (checkingToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-zinc-400">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt={webinarName} className="h-16 w-auto" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Video className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {webinarName}
          </h1>

          {webinarDescription && (
            <p className="text-zinc-400 text-center text-sm mb-6">
              {webinarDescription}
            </p>
          )}

          {/* Tabs Login/Registro */}
          <div className="flex mb-6 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); setError(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "login"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Já tenho acesso
            </button>
            <button
              onClick={() => { setMode("register"); setError(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === "register"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Quero me cadastrar
            </button>
          </div>

          {/* Formulário de Login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Email ou Telefone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="seu@email.com ou (11) 99999-9999"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Acessar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Formulário de Registro */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Cadastrar e Acessar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-zinc-500 text-xs text-center mt-6">
            Seus dados estão seguros e não serão compartilhados.
          </p>
        </div>
      </div>
    </div>
  )
}
