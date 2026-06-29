# Resumen de Contexto del Proyecto — Dashboard

Documento de handoff para continuar el desarrollo del dashboard en un chat nuevo de Cursor.  
**Última actualización:** junio 2026 — **versión inicial en producción** (`main`).

---

## 0. Estado de producción (v1)

| Aspecto | Detalle |
|---------|---------|
| **Rama de producción** | `main` (merge `dashboard-final` → `main`, commit `aff1172`) |
| **URL pública** | `https://www.globalscoreagent.com` (Vercel; apex redirige a `www`) |
| **Deploy** | Vercel — auto-deploy desde `main` |
| **Auth** | Supabase OAuth (Google/GitHub) + email/password; callback en `/auth/callback` |
| **Acceso dashboard** | `/dashboard/*` — requiere login + suscripción activa (trial o plan de pago) |
| **Versión** | **v1 inicial** — overview, directorio, detalle agente, HUMI/WAMI, perfil, suscripciones, feedbacks |

### Fixes recientes en producción (junio 2026)

- **OAuth:** `redirectTo` limpio (`/auth/callback` sin query); cookie `gsa_oauth_redirect`; cookies de sesión en la respuesta del callback; middleware reenvía `?code=` huérfano.
- **Dominio:** sin redirect `www → apex` en app (Vercel ya canonicaliza `www`); evitar bucles 308.
- **SSR dashboard:** layouts/páginas críticas con `dynamic(..., { ssr: false })` donde hace falta (p. ej. `Element type is invalid`).
- **Nonce chart:** fechas en timezone local (`formatLocalDateKey`) para alinear eje con datos DB.

---

## 1. Visión General del Proyecto

- **Nombre del proyecto:** `globalscoreagent-web` (Global Score Agent)
- **Objetivo del dashboard:** Panel autenticado (`/dashboard/*`) para explorar, filtrar y analizar agentes **ERC-8004**, con métricas **HUMI** (agente) y **WAMI** (wallet), estadísticas globales y por cadena, y vistas de detalle (pilares, warnings, on-chain, metadata, etc.).
- **Estado actual:** **~85%** del core funcional en producción v1.
  - **En producción:** overview, directorio + filtros, detalle agente, HUMI/WAMI por agente, perfil, suscripciones, feedbacks, APIs server-side con auth, pagos NOWPayments (webhook).
  - **Parcial / pendiente:** migración `chains` → `chains_stadistics` en `agents/[id]`, tests automatizados, páginas `uso`/`api` del menú, limpieza helpers legacy HUMI.

---

## 2. Stack Tecnológico

- **Framework:** Next.js **14.2.15** (App Router), React **18.3**, TypeScript **5**
- **Base de datos:** **Supabase (PostgreSQL)** — `@supabase/supabase-js`, `@supabase/ssr`; sin ORM
- **UI:** Tailwind CSS 3.4, Recharts, Framer Motion, Lucide, Radix UI
- **Auth:** Supabase Auth + `requireDashboardUser()` en `app/api/dashboard/**`
- **Pagos:** NOWPayments (Edge Function `gsa_nowpayments_webhook`, creación de invoice en suscripciones)
- **Deployment:** **Vercel** (`next build` / `next start`)

---

## 3. Estructura de Carpetas y Archivos Clave

```
globalscoreagent-web/
├── app/
│   ├── (dashboard)/dashboard/          # UI dashboard
│   │   ├── page.tsx                    # Home (overview) — DashboardPageClient
│   │   ├── agents/                     # Directorio + [id] + humi/wami
│   │   ├── humi/, wami/                # Redirect / query agentId
│   │   ├── perfil/, subscripciones/, feedbacks/
│   │   ├── uso/, api/                  # Placeholder / parcial
│   │   └── components/                 # Layout, i18n, sidebar, login gate
│   ├── auth/login/, auth/callback/     # Login público + OAuth callback
│   └── api/dashboard/                  # APIs autenticadas
│       ├── overview/                   # global_stadistics + chains_stadistics
│       ├── agents/, agents/[id]/, humi/, wami/
│       ├── profile/, subscriptions/, subscription-summary/
│       ├── api-credits/, redeem-promotional-code/, feedbacks/, news/
├── components/dashboard/               # Cards, charts, chain carousel, pilares
├── lib/                                # Parsers, auth redirect, pricing, series
├── content/                            # Copy dashboard (parcial) + docs manifest
├── docs/
│   ├── dashboard-context-summary.md    # Este archivo
│   ├── marketing-web-context-summary.md
│   ├── AGENT-RULES.md
│   └── sql/                            # MVs, funciones, imports (referencia)
└── utils/supabase/                     # Clientes SSR/browser (compartido)
```

**Rutas dashboard principales**

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Overview KPIs, nonce, distribuciones, carrusel por chain |
| `/dashboard/agents` | Directorio con filtros avanzados e infinite scroll |
| `/dashboard/agents/[id]` | Detalle agente |
| `/dashboard/agents/[id]/humi` | Índice HUMI del agente |
| `/dashboard/agents/[id]/wami` | Índice WAMI del agente |
| `/dashboard/perfil` | Cuenta, idioma, tema, favoritos |
| `/dashboard/subscripciones` | Planes, checkout, más detalles pricing |
| `/dashboard/feedbacks` | Comentarios / tickets |

---

## 4. Funcionalidades Implementadas (v1)

### Overview (`/dashboard`)

- KPIs globales: agentes, activos, feedback, wallets
- Card **nonce** (30 días) — `agent_nonce`, fechas locales
- Distribuciones HUMI / WAMI / metadata richness
- **DashboardChainCards:** stats agentes, owners, 30d, on-chain, madurez técnica (x402/MCP), top 10 HUMI, warnings, series mensuales, distribuciones HUMI/WAMI/metadata por chain

### Directorio (`/dashboard/agents`)

- Búsqueda, filtros avanzados, cadena, tags, skills
- Filtro HUMI por `humi_madurity_level` (Unstable → Elite + Not Calculated)
- Sort, paginación infinita, ribbon madurez en cards

### Detalle agente e índices

- Detalle completo con warnings, wallets, on-chain, feedback
- HUMI: 4 pilares, tendencias, resúmenes JSON
- WAMI: página dedicada por agente (`/dashboard/agents/[id]/wami`)

### Cuenta y suscripción

- Perfil, suscripciones, resumen de plan, créditos API
- Gate de login + suscripción activa (`DashboardLoginContext`)
- Detalle pricing reutiliza `lib/gsa/subscription-pricing-details.ts` (alineado con `/pricing` y docs)

### Perfiles públicos (relacionado, fuera del dashboard auth)

- Rutas públicas `/agents/[id]` (+ humi/wami) — APIs `app/api/web-page/agents/**` (sin login)

---

## 5. Lógica de Scoring (HUMI y WAMI)

Sin cambios de modelo respecto a la spec:

- **Cálculo en PostgreSQL** (`index_humi`, `index_wami`, MVs en `docs/sql/`)
- **4 pilares HUMI** × 25 pts; madurez Unstable → Elite + Not Calculated
- Frontend: presentación en `lib/agentHumiDisplay.ts`, `lib/indexHumi.ts`, `lib/dashboardChains.ts`
- Filtro NULL: `.is('humi_madurity_level', null)`; sort DESC con `nullsFirst: false`

Ver [`docs/español/index-humi.md`](español/index-humi.md) y [`docs/AGENT-RULES.md`](AGENT-RULES.md) §6.

---

## 6. Decisiones de Diseño y Arquitectura

- **Datos sensibles vía API server** — no Supabase directo desde browser en overview
- **Auth:** middleware protege `/dashboard` y `/api/dashboard`; callback OAuth en route handler con cookies en redirect response
- **i18n ES/EN** + tema claro/oscuro (`LanguageContext`)
- **Branding sidebar:** logo según tema en `DashboardSidebar` — `public/logo-gsa-dashboard-oscuro.png` (dark) / `public/logo-gsa-dashboard-claro.png` (light); marketing usa `public/logo-gsa.png` fijo
- **Monorepo:** marketing + dashboard en `main`; desarrollo histórico en ramas `web-page-v2` / `dashboard-final` (ver [`BRANCHING.md`](BRANCHING.md))
- **SSR:** componentes dashboard pesados con `dynamic(..., { ssr: false })` donde el árbol de client components lo exige

---

## 7. Integración con Base de Datos

### Esquema `web_dashboard`

| Objeto | Uso |
|--------|-----|
| `global_stadistics` (MV) | Stats globales overview |
| `chains_stadistics` (MV) | Stats por cadena; PK `id` → `chain_id` en API |
| `agents` | Directorio y detalle |
| `agent_advanced_filters` | Filtros avanzados UI |
| `index_humi` | Detalle HUMI por agente |
| `gsa.*` | Suscripciones, pagos, créditos API (ver Edge Functions) |

### Flujo overview

```
/dashboard → GET /api/dashboard/overview
  → web_dashboard.global_stadistics (latest calculated_at)
  → web_dashboard.chains_stadistics (+ enrich top 10 agents)
```

### Pendiente conocido

- `app/api/dashboard/agents/[id]/route.ts` — aún puede usar `.from('chains')` legacy para logos; migrar a `chains_stadistics`

---

## 8. Próximos Pasos / Tareas Pendientes

### Prioridad alta

1. Migrar `agents/[id]/route.ts`: `chains` → `chains_stadistics`
2. Confirmar REFRESH + GRANT de MVs en Supabase producción
3. Índices: `db/indexes_web_dashboard_agents_humi_madurity_level.sql` si no aplicados

### Prioridad media

4. Limpiar `humiFilterFromNumericScore` legacy en `ChainTopAgentsList`
5. Descarga markdown resumen por chain (propuesta documentada en conversaciones)
6. Tests API dashboard

### Prioridad baja

7. Completar páginas `uso`, `api` del menú
8. Sincronizar docs SQL eliminados del repo con copia externa si hace falta

---

## 9. Reglas y Preferencias

Ver [`docs/AGENT-RULES.md`](AGENT-RULES.md) y [`.cursor/rules/dashboard-branch.mdc`](../.cursor/rules/dashboard-branch.mdc).

- Trabajar en **`main`** para fixes de producción (o rama feature → PR → `main`)
- No tocar marketing (`app/page.tsx`, `components/marketing/**`) salvo shared acordado
- Diff mínimo; no commits/push salvo petición explícita

---

## 10. Contexto Adicional — changelog v1 (merge → producción)

| Área | Cambio |
|------|--------|
| **Merge** | `dashboard-final` integrado en `main` (`aff1172`, `b93ac55`) |
| **WAMI** | Páginas dashboard y públicas WAMI por agente |
| **Agentes públicos** | `/agents/[id]`, APIs `web-page/agents` |
| **SSR** | Fixes dynamic import en layout/página dashboard |
| **Nonce** | Corrección timezone en serie 30d |
| **Auth prod** | OAuth Google/GitHub operativo en `globalscoreagent.com` |
| **Docs dashboard** | `docs/español/dashboard/*`, `docs/ingles/dashboard/*` |
| **Branding** | Logos sidebar por tema (`logo-gsa-dashboard-oscuro` / `logo-gsa-dashboard-claro`) |

---

## 11. Instrucciones para agentes Cursor (handoff)

**Reglas generales:** [`docs/AGENT-RULES.md`](AGENT-RULES.md)  
**Web pública (marketing):** [`docs/marketing-web-context-summary.md`](marketing-web-context-summary.md)

### Prompt sugerido — dashboard

```text
Lee docs/AGENT-RULES.md y docs/dashboard-context-summary.md.
Producción en main (globalscoreagent.com). Rama feature → PR → main.
BD: docs/sql/ + app/api/dashboard/** como fuente práctica.
Auth: requireDashboardUser(); OAuth vía /auth/callback.
No modifiques marketing salvo shared acordado.
```

### Archivos SQL frecuentes

| Tarea | Archivo en `docs/sql/` |
|-------|-------------------------|
| Stats globales | `web_dashboard_global_stadistics.sql` |
| Stats por cadena | `web_dashboard_chains.sql` / `chains_stadistics` en BD |
| Import agentes / HUMI / WAMI | `web_dashboard_*_import_data.sql` |
| Proceso diario | `web_dashboard_daily_process.sql` |

---

*Última revisión: junio 2026 — v1 en producción. Actualizar tras migraciones BD, nuevas rutas dashboard o cambios de auth/deploy.*
