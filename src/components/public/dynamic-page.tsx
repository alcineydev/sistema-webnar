"use client"

import { useEffect, useRef } from "react"

interface Plan {
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

interface Page {
  id: string
  title: string
  htmlContent: string | null
  cssContent: string | null
  jsContent: string | null
}

interface Props {
  page: Page
  plans: Plan[]
}

export function DynamicPage({ page, plans }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!page.jsContent || !containerRef.current) return

    const script = document.createElement("script")
    script.type = "text/javascript"
    script.textContent = page.jsContent
    containerRef.current.appendChild(script)

    return () => {
      script.remove()
    }
  }, [page.jsContent])

  let processedHtml = page.htmlContent || ""

  if (plans.length > 0 && processedHtml.includes("<!-- PLANOS_DINAMICOS -->")) {
    const plansHtml = generatePlansHTML(plans)
    processedHtml = processedHtml.replace("<!-- PLANOS_DINAMICOS -->", plansHtml)
  }

  return (
    <>
      {page.cssContent ? <style dangerouslySetInnerHTML={{ __html: page.cssContent }} /> : null}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: processedHtml }} />
    </>
  )
}

function generatePlansHTML(plans: Plan[]): string {
  const formatLimit = (value: number) => (value === -1 ? "Ilimitado" : value.toString())

  const plansCards = plans
    .map(
      (plan) => `
    <div class="plan-card ${plan.isPopular ? "plan-popular" : ""}">
      ${plan.isPopular ? '<span class="plan-badge">Popular</span>' : ""}
      <h3>${escapeHtml(plan.name)}</h3>
      <div class="plan-price">
        <span class="price">R$ ${plan.priceMonthly.toFixed(0)}</span>
        <span class="period">/mes</span>
      </div>
      <p class="plan-description">${escapeHtml(plan.description || "")}</p>
      <ul class="plan-features">
        <li>${formatLimit(plan.maxWebinars)} webinars</li>
        <li>${formatLimit(plan.maxLeadsMonth)} leads/mes</li>
      </ul>
      <a href="/registro?plan=${encodeURIComponent(plan.slug)}" class="plan-button">
        ${plan.isPopular ? "Comecar Agora" : "Selecionar"}
      </a>
    </div>
  `
    )
    .join("")

  return `
    <section id="pricing" class="pricing">
      <div class="container">
        <h2>Escolha seu Plano</h2>
        <p class="pricing-subtitle">Cancele quando quiser</p>
        <div class="plans-grid">
          ${plansCards}
        </div>
      </div>
    </section>

    <style>
      .pricing {
        padding: 80px 0;
        background: #f8fafc;
      }
      .pricing h2 {
        text-align: center;
        font-size: 36px;
        margin-bottom: 8px;
      }
      .pricing-subtitle {
        text-align: center;
        color: #64748b;
        margin-bottom: 48px;
      }
      .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        max-width: 1000px;
        margin: 0 auto;
      }
      .plan-card {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 32px;
        position: relative;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .plan-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.1);
      }
      .plan-popular {
        border-color: #6366f1;
        transform: scale(1.05);
      }
      .plan-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: #6366f1;
        color: white;
        padding: 4px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      .plan-card h3 {
        font-size: 24px;
        margin-bottom: 16px;
      }
      .plan-price {
        margin-bottom: 16px;
      }
      .plan-price .price {
        font-size: 48px;
        font-weight: 700;
        color: #0f172a;
      }
      .plan-price .period {
        color: #64748b;
      }
      .plan-description {
        color: #64748b;
        margin-bottom: 24px;
      }
      .plan-features {
        list-style: none;
        margin-bottom: 32px;
      }
      .plan-features li {
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
        color: #475569;
      }
      .plan-features li:before {
        content: "✓";
        color: #22c55e;
        margin-right: 8px;
      }
      .plan-button {
        display: block;
        text-align: center;
        padding: 14px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: background 0.2s;
      }
      .plan-card .plan-button {
        background: white;
        border: 2px solid #6366f1;
        color: #6366f1;
      }
      .plan-card .plan-button:hover {
        background: #eef2ff;
      }
      .plan-popular .plan-button {
        background: #6366f1;
        border-color: #6366f1;
        color: white;
      }
      .plan-popular .plan-button:hover {
        background: #4f46e5;
      }
    </style>
  `
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
