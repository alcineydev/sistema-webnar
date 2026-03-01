import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prismaMaster } from "@/lib/db/master"
import { DynamicPage } from "@/components/public/dynamic-page"

interface Props {
  params: { slug?: string[] }
}

interface PlanSummary {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number | null
  maxWebinars: number
  maxLeadsMonth: number
  isPopular: boolean
}

function getJoinedSlug(params: Props["params"]) {
  const value = params.slug?.join("/") || "/"
  if (!value) return "/"
  return value
}

async function getPage(slug: string) {
  return prismaMaster.page.findFirst({
    where: {
      slug,
      status: "published",
    },
  })
}

async function getPlans(): Promise<PlanSummary[]> {
  return prismaMaster.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceMonthly: true,
      priceYearly: true,
      maxWebinars: true,
      maxLeadsMonth: true,
      isPopular: true,
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = getJoinedSlug(params)
  const page = await getPage(slug)

  if (!page) {
    if (slug === "/") {
      return {
        title: "Webinar Hub",
        description: "Plataforma para criar e vender webinars com area de membros e automacoes.",
      }
    }
    return { title: "Pagina nao encontrada" }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  }
}

export default async function PublicPage({ params }: Props) {
  const slug = getJoinedSlug(params)

  const ignoredPaths = ["api", "admin", "superadmin", "painel", "w", "login", "registro"]
  if (params.slug?.[0] && ignoredPaths.includes(params.slug[0])) {
    notFound()
  }

  const page = await getPage(slug)

  if (!page) {
    if (slug === "/") {
      const plans = await getPlans()
      return <PublicHomeFallback plans={plans} />
    }

    const page404 = await getPage("404")
    if (page404?.htmlContent?.trim()) {
      return <DynamicPage page={page404} plans={[]} />
    }

    return <PublicNotFoundFallback />
  }

  const plans = page.type === "home" ? await getPlans() : []
  return <DynamicPage page={page} plans={plans} />
}

function PublicHomeFallback({ plans }: { plans: PlanSummary[] }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Crie Webinars Profissionais em Minutos
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Plataforma completa para capturar leads, entregar aulas e vender com ofertas no momento certo.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/registro"
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Comecar Agora
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Entrar
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-xl border bg-white p-5 ${plan.isPopular ? "border-indigo-600" : "border-slate-200"}`}
            >
              {plan.isPopular ? (
                <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  Popular
                </span>
              ) : null}
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.description || "Plano para operar webinars com performance."}</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">R$ {plan.priceMonthly.toFixed(0)}</p>
              <p className="text-sm text-slate-500">/mes</p>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                <li>{plan.maxWebinars === -1 ? "Webinars ilimitados" : `${plan.maxWebinars} webinars`}</li>
                <li>{plan.maxLeadsMonth === -1 ? "Leads ilimitados" : `${plan.maxLeadsMonth} leads/mes`}</li>
              </ul>
              <Link
                href={`/registro?plan=${encodeURIComponent(plan.slug)}`}
                className="mt-5 inline-block w-full rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
              >
                Selecionar
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function PublicNotFoundFallback() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Erro 404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Pagina nao encontrada</h1>
        <p className="mt-2 text-slate-600">A pagina solicitada nao existe ou nao esta publicada.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Voltar para a home
        </Link>
      </div>
    </main>
  )
}
