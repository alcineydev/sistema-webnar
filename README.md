# Webinar Hub SaaS

Plataforma SaaS multi-tenant para criacao e gerenciamento de webinars.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js v5
- **Pagamentos:** Asaas
- **Deploy:** Vercel
- **UI:** Tailwind CSS + Shadcn/UI

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta Asaas (sandbox ou producao)

## Setup Local

```bash
# Clonar repositorio
git clone <repo>
cd webinar-hub

# Instalar dependencias
npm install

# Configurar variaveis
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Gerar Prisma
npm run db:generate

# Aplicar migrations
npm run db:push

# Seed inicial
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

## Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build producao
npm run start        # Iniciar producao
npm run lint         # Verificar lint
npm run db:generate  # Gerar Prisma
npm run db:push      # Aplicar schema
npm run db:seed      # Popular dados
npm run db:studio    # Abrir Prisma Studio
```

## Estrutura

- `/src/app/(public)` - Paginas publicas
- `/src/app/(superadmin)` - Area do super admin
- `/src/app/(dashboard)` - Dashboard do cliente
- `/src/app/w/[tenant]/[slug]` - Area do webinar

## Documentacao

Ver pasta `/Docs` para documentacao completa de cada fase.

## Deploy

1. Configurar variaveis no Vercel
2. Conectar repositorio GitHub
3. Deploy automatico na branch `master`

## Licenca

Proprietario - Todos os direitos reservados.
