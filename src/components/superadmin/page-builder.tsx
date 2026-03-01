"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Code,
  Eye,
  Loader2,
  Monitor,
  Palette,
  Save,
  Settings,
  Smartphone,
  Tablet,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Page {
  id: string | null
  title: string
  slug: string
  type: string
  status: string
  htmlContent: string | null
  cssContent: string | null
  jsContent: string | null
  metaTitle: string | null
  metaDescription: string | null
}

interface Props {
  page: Page | null
  isNew: boolean
}

type EditorTab = "html" | "css" | "js" | "settings"
type PreviewSize = "desktop" | "tablet" | "mobile"

export function PageBuilder({ page, isNew }: Props) {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<EditorTab>("html")
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop")
  const [showPreview, setShowPreview] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    type: page?.type || "normal",
    status: page?.status || "draft",
    htmlContent: page?.htmlContent || DEFAULT_HTML,
    cssContent: page?.cssContent || DEFAULT_CSS,
    jsContent: page?.jsContent || "",
    metaTitle: page?.metaTitle || "",
    metaDescription: page?.metaDescription || "",
  })

  const previewDocument = useMemo(
    () => `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${formData.cssContent}</style>
  </head>
  <body>
    ${formData.htmlContent}
    <script>${formData.jsContent}</script>
  </body>
</html>`,
    [formData.cssContent, formData.htmlContent, formData.jsContent]
  )

  useEffect(() => {
    if (!iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return

    doc.open()
    doc.write(previewDocument)
    doc.close()
  }, [previewDocument])

  async function handleSave(publish = false) {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        slug: normalizeSlug(formData.slug),
        status: publish ? "published" : formData.status,
      }

      const url = isNew ? "/api/superadmin/pages" : `/api/superadmin/pages/${page?.id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(result.error || "Erro ao salvar pagina")
        return
      }

      if (isNew && result.id) {
        router.push(`/superadmin/paginas/${result.id}`)
      } else {
        router.refresh()
      }
    } catch {
      setError("Erro inesperado ao salvar pagina")
    } finally {
      setLoading(false)
    }
  }

  const previewSizes: Record<PreviewSize, string> = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  }

  return (
    <div className="-m-8 flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex h-14 flex-shrink-0 items-center justify-between bg-slate-900 px-4">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/paginas">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-700" />
          <Input
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Titulo da pagina"
            className="w-64 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-800 p-1">
            <button
              onClick={() => setPreviewSize("desktop")}
              className={`rounded p-1.5 ${
                previewSize === "desktop" ? "bg-slate-700 text-white" : "text-slate-400"
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewSize("tablet")}
              className={`rounded p-1.5 ${
                previewSize === "tablet" ? "bg-slate-700 text-white" : "text-slate-400"
              }`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewSize("mobile")}
              className={`rounded p-1.5 ${
                previewSize === "mobile" ? "bg-slate-700 text-white" : "text-slate-400"
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((prev) => !prev)}
            className="text-slate-400 hover:text-white"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleSave(false)}
            disabled={loading}
            className="text-slate-400 hover:text-white"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>

          <Button
            size="sm"
            onClick={() => void handleSave(true)}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Publicar
          </Button>
        </div>
      </div>

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-12 flex-col items-center gap-2 bg-slate-800 py-4">
          <IconTab
            title="HTML"
            active={activeTab === "html"}
            onClick={() => setActiveTab("html")}
            icon={Code}
          />
          <IconTab
            title="CSS"
            active={activeTab === "css"}
            onClick={() => setActiveTab("css")}
            icon={Palette}
          />
          <IconTab
            title="JavaScript"
            active={activeTab === "js"}
            onClick={() => setActiveTab("js")}
            icon={Zap}
          />
          <div className="flex-1" />
          <IconTab
            title="Configuracoes"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={Settings}
          />
        </div>

        <div className={`flex flex-col bg-slate-900 ${showPreview ? "w-1/2" : "flex-1"}`}>
          <div className="flex h-10 items-center border-b border-slate-700 bg-slate-800 px-4">
            <span className="text-sm text-slate-400">
              {activeTab === "html" && "index.html"}
              {activeTab === "css" && "styles.css"}
              {activeTab === "js" && "script.js"}
              {activeTab === "settings" && "config.json"}
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "settings" ? (
              <SettingsEditor formData={formData} setFormData={setFormData} />
            ) : (
              <textarea
                value={
                  activeTab === "html"
                    ? formData.htmlContent
                    : activeTab === "css"
                      ? formData.cssContent
                      : formData.jsContent
                }
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    [activeTab === "html"
                      ? "htmlContent"
                      : activeTab === "css"
                        ? "cssContent"
                        : "jsContent"]: event.target.value,
                  }))
                }
                className="h-full w-full resize-none bg-slate-900 p-4 font-mono text-sm text-slate-300 focus:outline-none"
                spellCheck={false}
              />
            )}
          </div>
        </div>

        {showPreview ? (
          <div className="flex flex-1 flex-col bg-slate-100">
            <div className="flex h-10 items-center border-b border-slate-200 bg-white px-4">
              <span className="text-sm text-slate-500">Preview</span>
            </div>
            <div className="flex flex-1 justify-center overflow-auto p-4">
              <div className={`bg-white shadow-lg transition-all ${previewSizes[previewSize]}`}>
                <iframe ref={iframeRef} className="min-h-[600px] w-full" title="Preview" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function IconTab({
  title,
  active,
  onClick,
  icon: Icon,
}: {
  title: string
  active: boolean
  onClick: () => void
  icon: React.ElementType
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg p-2 transition-colors ${
        active ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

function SettingsEditor({
  formData,
  setFormData,
}: {
  formData: {
    slug: string
    type: string
    status: string
    metaTitle: string
    metaDescription: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string
      slug: string
      type: string
      status: string
      htmlContent: string
      cssContent: string
      jsContent: string
      metaTitle: string
      metaDescription: string
    }>
  >
}) {
  return (
    <div className="h-full space-y-4 overflow-y-auto p-6">
      <div className="space-y-2">
        <Label className="text-slate-300">Slug (URL)</Label>
        <Input
          value={formData.slug}
          onChange={(event) => setFormData((prev) => ({ ...prev, slug: event.target.value }))}
          placeholder="minha-pagina"
          className="border-slate-700 bg-slate-800 text-white"
        />
        <p className="text-xs text-slate-500">Use / para a home principal</p>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Tipo</Label>
        <select
          value={formData.type}
          onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
        >
          <option value="home">Home</option>
          <option value="normal">Normal</option>
          <option value="404">Erro 404</option>
          <option value="terms">Termos de Uso</option>
          <option value="privacy">Politica de Privacidade</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Status</Label>
        <select
          value={formData.status}
          onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
        >
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
        </select>
      </div>

      <hr className="border-slate-700" />

      <div className="space-y-2">
        <Label className="text-slate-300">Meta Title (SEO)</Label>
        <Input
          value={formData.metaTitle}
          onChange={(event) => setFormData((prev) => ({ ...prev, metaTitle: event.target.value }))}
          placeholder="Titulo para SEO"
          className="border-slate-700 bg-slate-800 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Meta Description</Label>
        <textarea
          value={formData.metaDescription}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, metaDescription: event.target.value }))
          }
          placeholder="Descricao para SEO"
          className="h-24 w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
        />
      </div>
    </div>
  )
}

function normalizeSlug(slug: string) {
  const trimmed = slug.trim()
  if (trimmed === "/" || trimmed === "") return "/"
  return trimmed.replace(/^\/+/, "").replace(/\/+$/, "")
}

const DEFAULT_HTML = `<header class="header">
  <nav class="container">
    <div class="logo">Webinar Hub</div>
    <div class="nav-links">
      <a href="#features">Funcionalidades</a>
      <a href="#pricing">Planos</a>
      <a href="/login" class="btn-login">Entrar</a>
    </div>
  </nav>
</header>

<section class="hero">
  <div class="container">
    <h1>Crie Webinars Profissionais em Minutos</h1>
    <p>Plataforma completa para hospedar seus cursos online, capturar leads e vender com ofertas no momento certo.</p>
    <div class="hero-buttons">
      <a href="/registro" class="btn-primary">Comecar Gratis</a>
      <a href="#demo" class="btn-secondary">Ver Demo</a>
    </div>
  </div>
</section>

<section id="features" class="features">
  <div class="container">
    <h2>Tudo que voce precisa</h2>
    <div class="features-grid">
      <div class="feature-card">
        <h3>Player Customizado</h3>
        <p>YouTube com sua marca e cores</p>
      </div>
      <div class="feature-card">
        <h3>Ofertas no Tempo Certo</h3>
        <p>CTA aparece no segundo exato</p>
      </div>
      <div class="feature-card">
        <h3>Tracking Completo</h3>
        <p>Pixels e analytics integrados</p>
      </div>
    </div>
  </div>
</section>

<!-- PLANOS_DINAMICOS -->

<footer class="footer">
  <div class="container">
    <p>&copy; 2026 Webinar Hub. Todos os direitos reservados.</p>
  </div>
</footer>`

const DEFAULT_CSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #6366f1;
}

.nav-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-links a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #6366f1;
}

.btn-login {
  padding: 8px 20px;
  background: #6366f1;
  color: white !important;
  border-radius: 8px;
}

.hero {
  padding: 160px 0 80px;
  background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
  text-align: center;
}

.hero h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #0f172a;
}

.hero p {
  font-size: 20px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 40px;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary {
  padding: 16px 32px;
  background: #6366f1;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-secondary {
  padding: 16px 32px;
  border: 2px solid #e2e8f0;
  color: #1e293b;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: border-color 0.2s;
}

.btn-secondary:hover {
  border-color: #6366f1;
}

.features {
  padding: 80px 0;
}

.features h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  padding: 32px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  text-align: center;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.feature-card p {
  color: #64748b;
}

.footer {
  padding: 40px 0;
  background: #0f172a;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 768px) {
  .hero h1 { font-size: 32px; }
  .features-grid { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}`
