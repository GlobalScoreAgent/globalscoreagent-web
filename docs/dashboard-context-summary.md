# Resumen de Contexto del Proyecto — Dashboard

Documento de handoff para continuar el desarrollo del dashboard en un chat nuevo de Cursor.  
**Última actualización:** julio 2026 — Walcert en dashboard (`/dashboard/walcert`: preview live + verificación por tx_hash + ejemplos).

---

## 0. Estado de producción (v1)

| Aspecto | Detalle |
|---------|---------|
| **Rama de producción** | `main` (auto-deploy Vercel) |
| **URL pública** | `https://www.globalscoreagent.com` (apex → `www`) |
| **Deploy** | Vercel desde `main` |
| **Auth** | Supabase OAuth (Google/GitHub) + email/password; callback `/auth/callback` |
| **Acceso dashboard** | `/dashboard/*` — login + suscripción activa |
| **Versión** | **v1** — overview, directorio, detalle agente, HUMI/WAMI, **Walcert** (preview + verify + ejemplos), perfil, suscripciones, feedbacks, responsive móvil |

### Changelog (julio 2026)

- **Walcert dashboard** (`/dashboard/walcert`): preview live vía proxy `POST /api/dashboard/walcert/preview` → agente `/v1/preview/{type}` **solo origins/activity** (Alchemy); rate limit 8/IP/15min (proxy reenvía IP del cliente); **verificar certificado** vía `POST /api/dashboard/walcert/verify` → agente `/v1/verify` (tx_hash; sin Celo en el front); 4 reportes de ejemplo; sin x402 en UI. Env: `WALCERT_BASE_URL` (default `https://walcert.globalscoreagent.com`).
- UI: `grade_label` / `note` del agente son bilingües `{eng,esp}` — siempre vía `pickAgentLang`.
- Link secundario a **agent card** (JSON) + marketing CTAs → login con `redirect=/dashboard/walcert`.
- Identidad canónica web: agentId **9699** (no copiar `9696` del agent card en VPS si aparece).

### Changelog relevante (junio–julio 2026)

- **OAuth / dominio / SSR** — redirects limpios, cookies en callback, `dynamic(..., { ssr: false })` donde hace falta.
- **Nonce chart** — fechas timezone local.
- **Branding sidebar** — logos por tema (`logo-gsa-dashboard-oscuro` / `logo-gsa-dashboard-claro`).
- **Dashboard móvil** (`dashboard-movil` → `main`, jul 2026):
  - Shell: drawer off-canvas (`DashboardMobileNavContext`), sidebar + topnav responsive.
  - Overview dual: columna móvil (`md:hidden`) vs grid desktop (`hidden md:flex`).
  - Chains: cards modulares en móvil + card monolítica desktop (`ChainDesktopCard`).
  - Distribuciones stacked **verticales** en móvil; horizontales en desktop overview.
  - Fixes: overflow wallet on-chain, badges Nonce sin solape, Recharts `minHeight` en barras verticales.

---

## 1. Visión General del Proyecto

- **Nombre del proyecto:** `globalscoreagent-web` (Global Score Agent)
- **Objetivo del dashboard:** Panel autenticado (`/dashboard/*`) para explorar, filtrar y analizar agentes **ERC-8004**, con métricas **HUMI** (agente) y **WAMI** (wallet), estadísticas globales y por cadena, y vistas de detalle.
- **Estado actual:** core funcional en producción v1 + UX usable en móvil.
  - **En producción:** overview, directorio + filtros, detalle agente, HUMI/WAMI, perfil, suscripciones, feedbacks, shell responsive, chain dual móvil/desktop.
  - **Parcial / pendiente:** migración `chains` → `chains_stadistics` en `agents/[id]`, tests automatizados, páginas `uso`/`api` del menú, limpiar helpers legacy HUMI; vigilar **GRANT** tras REFRESH de MVs.

---

## 2. Stack Tecnológico

- **Framework:** Next.js **14.2.15** (App Router), React **18.3**, TypeScript **5**
- **Base de datos:** **Supabase (PostgreSQL)** — `@supabase/supabase-js`, `@supabase/ssr`; sin ORM
- **UI:** Tailwind CSS 3.4, Recharts, Framer Motion, Lucide, Radix UI
- **Auth:** Supabase Auth + `requireDashboardUser()` en `app/api/dashboard/**`
- **Pagos:** NOWPayments (Edge Function `gsa_nowpayments_webhook`)
- **Deployment:** **Vercel**

---

## 3. Estructura de Carpetas y Archivos Clave

```
globalscoreagent-web/
├── app/
│   ├── (dashboard)/dashboard/          # UI dashboard
│   │   ├── page.tsx                    # Home — DashboardPageClient
│   │   ├── agents/                     # Directorio + [id] + humi/wami
│   │   ├── walcert/                    # Preview live + verify tx_hash + ejemplos A–F
│   │   ├── components/                 # Layout, i18n, sidebar, mobile nav, overview panels
│   │   │   ├── DashboardLayoutClient.tsx
│   │   │   ├── DashboardMobileNavContext.tsx   # Drawer móvil
│   │   │   ├── DashboardOverviewPanels.tsx     # Layout dual móvil / desktop
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── DashboardTopNav.tsx
│   └── api/dashboard/
│       ├── overview/                   # global_stadistics + chains_stadistics
│       ├── agents/, agents/[id]/, humi/, wami/
│       ├── walcert/preview/            # Proxy a Walcert Agent /v1/preview
│       ├── walcert/verify/             # Proxy a Walcert Agent /v1/verify
│       ├── profile/, subscriptions/, …
├── components/dashboard/
│   ├── walcert/                        # Live preview + verify + ejemplos
│   ├── chain/
│   │   ├── ChainSelector.tsx           # Tabs sticky (móvil)
│   │   ├── ChainModuleCards.tsx        # Stack modular (móvil)
│   │   └── ChainDesktopCard.tsx        # Card única + rail (desktop ≥md)
│   ├── DashboardChainCards.tsx         # Orquestador: móvil vs desktop
│   ├── DashboardNonceInsightCard.tsx
│   ├── StackedDistributionBar.tsx
│   └── …
├── lib/
│   ├── dashboardChainCardData.ts       # Parsing compartido chain cards
│   ├── dashboardChains.ts
│   └── …
└── docs/
    ├── dashboard-context-summary.md    # Este archivo
    ├── AGENT-RULES.md
    └── supabase-auth-setup.md
```

**Rutas dashboard principales**

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Overview KPIs, nonce, distribuciones, chains |
| `/dashboard/agents` | Directorio + filtros + infinite scroll |
| `/dashboard/agents/[id]` | Detalle agente |
| `/dashboard/agents/[id]/humi` | Índice HUMI |
| `/dashboard/agents/[id]/wami` | Índice WAMI |
| `/dashboard/perfil` | Cuenta, idioma, tema |
| `/dashboard/subscripciones` | Planes / checkout |
| `/dashboard/feedbacks` | Comentarios / tickets |

---

## 4. Funcionalidades Implementadas (v1)

### Overview (`/dashboard`) — layout responsive

Corte Tailwind **`md` (768px)** en [`DashboardOverviewPanels.tsx`](../app/(dashboard)/dashboard/components/DashboardOverviewPanels.tsx):

| Viewport | Orden / layout |
|----------|----------------|
| **Móvil** (`md:hidden`) | 1. KPI (`DashboardStatsGrid` `section="all"`) → 2. Top 10 HUMI → 3. Daily Nonce → 4. Distribución global (barras **verticales**, leyenda bottom) → luego Chain cards |
| **Desktop** (`hidden md:flex`) | Grid 12 cols compact: KPIs + Nonce/Top10 en fila; KPIs bottom + distribución **horizontal** / leyenda side |

### Chain cards (`DashboardChainCards`)

| Viewport | UI |
|----------|-----|
| **Móvil** (`md:hidden`) | `ChainSelector` (tabs sticky) + `ChainCardsStack` modular |
| **Desktop** (`hidden md:flex`) | `ChainDesktopCard` (una card + mini-shells + rail distribución) + selector por puntos |

**Orden del stack móvil** (`ChainCardsStack`):

1. Top 10 HUMI  
2. Summary (logo/nombre)  
3. Agent stats / Owners / Technical maturity  
4. Activity 30d / Warnings  
5. Monthly trend  
6. Distribution  

Datos: `lib/dashboardChainCardData.ts` → `buildChainCardData()` (compartido móvil/desktop).

### Directorio, detalle, cuenta

- Sin cambio de modelo respecto a v1: filtros avanzados, HUMI/WAMI, perfil, suscripciones, gate login.
- Detalle agente: cards on-chain / owner con wrap de wallets en móvil (`min-w-0`, `break-all`).

### Perfiles públicos (fuera del dashboard auth)

- `/agents/[id]` (+ humi/wami) — `app/api/web-page/agents/**`

---

## 5. Lógica de Scoring (HUMI y WAMI)

Sin cambios de modelo:

- Cálculo en PostgreSQL (`index_humi`, `index_wami`)
- 4 pilares HUMI × 25 pts; madurez Unstable → Elite + Not Calculated
- Frontend: `lib/agentHumiDisplay.ts`, `lib/indexHumi.ts`, `lib/dashboardChains.ts`
- Not Calculated: `.is('humi_madurity_level', null)`

Ver [`docs/español/index-humi.md`](español/index-humi.md) y [`docs/AGENT-RULES.md`](AGENT-RULES.md) §6.

---

## 6. Decisiones de Diseño y Arquitectura

- **Datos sensibles vía API server** — overview no usa Supabase desde browser
- **Auth:** middleware `/dashboard` + `/api/dashboard`; overview = JWT `authenticated` (**no** `service_role`)
- **i18n ES/EN** + tema claro/oscuro
- **Responsive:** dos árboles de componentes en overview y chains (mismo patrón que `md:hidden` / `hidden md:flex`)
- **Recharts vertical + `fillHeight`:** necesita `minHeight` / shell `min-h-[9rem]` o el chart colapsa (leyenda visible, área vacía)
- **Monorepo:** trabajo diario en **`main`** o feature branch → PR → `main`
- **SSR:** `dynamic(..., { ssr: false })` donde el árbol client lo exige

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
| `gsa.*` | Suscripciones, pagos, créditos API |

### Flujo overview

```
/dashboard → GET /api/dashboard/overview
  → web_dashboard.global_stadistics (latest calculated_at)
  → web_dashboard.chains_stadistics (+ enrich top 10 agents)
```

Si **cualquiera** de las dos queries falla → UI muestra `dashboardDataLoadError`  
(ES: «No hay conexión con la base de datos…») — **mensaje genérico**.

### Diagnóstico típico (julio 2026)

| Síntoma | Causa real observada |
|---------|----------------------|
| Overview error “sin conexión” | `chains_stadistics` **403** / `permission denied for materialized view` — falta `GRANT SELECT … TO authenticated` tras REFRESH/recreate |
| `/dashboard/agents` 400 | Columna `agents.nonce_current` inexistente (API desalineada con BD) |

Tras recrear/refrescar MVs, reaplicar:

```sql
GRANT SELECT ON web_dashboard.chains_stadistics TO authenticated, anon, authenticator;
-- global_stadistics ya suele tener authenticated=r; verificar con has_table_privilege(...)
```

Schema expuesto: **API → Exposed schemas** incluye `web_dashboard`. Detalle: [`docs/supabase-auth-setup.md`](supabase-auth-setup.md).

### Pendiente conocido (código)

- `app/api/dashboard/agents/[id]/route.ts` — aún puede usar `.from('chains')` legacy; migrar a `chains_stadistics`

---

## 8. Próximos Pasos / Tareas Pendientes

### Prioridad alta

1. Migrar `agents/[id]/route.ts`: `chains` → `chains_stadistics`
2. Tras cada REFRESH de MVs: verificar GRANT `authenticated` en `global_stadistics` y `chains_stadistics`
3. Alinear API agents con columnas reales (p. ej. `nonce_current` si se eliminó)

### Prioridad media

4. Limpiar `humiFilterFromNumericScore` legacy
5. Tests API dashboard
6. Índices `db/indexes_web_dashboard_agents_humi_madurity_level.sql` si no aplicados

### Prioridad baja

7. Completar páginas `uso`, `api` del menú

---

## 9. Reglas y Preferencias

Ver [`docs/AGENT-RULES.md`](AGENT-RULES.md) y [`.cursor/rules/`](../.cursor/rules/).

- Trabajar en **`main`** o feature → PR → `main`
- No tocar marketing salvo shared acordado
- Diff mínimo; no commits/push salvo petición explícita

---

## 10. Contexto Adicional — changelog v1

| Área | Cambio |
|------|--------|
| **Merge inicial** | `dashboard-final` → `main` (jun 2026) |
| **Móvil** | `dashboard-movil` → `main` (jul 2026): shell, overview dual, chains dual, distribuciones verticales |
| **WAMI / agentes públicos** | Páginas dedicadas + APIs `web-page` |
| **Auth prod** | OAuth en `globalscoreagent.com` |
| **Branding** | Logos sidebar por tema |

---

## 11. Instrucciones para agentes Cursor (handoff)

**Reglas generales:** [`docs/AGENT-RULES.md`](AGENT-RULES.md)  
**Web pública:** [`docs/marketing-web-context-summary.md`](marketing-web-context-summary.md)

### Prompt sugerido — dashboard

```text
Usa la skill gsa-aplicacion. Lee docs/AGENT-RULES.md y docs/dashboard-context-summary.md.
Producción en main (www.globalscoreagent.com). Feature branch → PR → main.
BD: docs/sql/ + app/api/dashboard/** (Supabase puede diferir).
Auth: requireDashboardUser(); overview usa JWT authenticated (no service_role).
Responsive: md=768 — overview y chains tienen árboles móvil vs desktop.
Si overview dice "sin conexión", revisar 403/GRANT en chains_stadistics, no asumir caída de BD.
No modifiques marketing salvo shared acordado.
Tarea: [DESCRIBE]
```

### Archivos SQL frecuentes

| Tarea | Archivo en `docs/sql/` |
|-------|-------------------------|
| Stats globales | `web_dashboard_global_stadistics.sql` |
| Stats por cadena | `web_dashboard_chains.sql` / MV `chains_stadistics` en BD |
| Import agentes / HUMI / WAMI | `web_dashboard_*_import_data.sql` |
| Proceso diario | `web_dashboard_daily_process.sql` |

---

*Última revisión: julio 2026 — v1 + dashboard móvil en `main`. Actualizar tras migraciones BD, cambios de grants o nuevas rutas responsive.*
