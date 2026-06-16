# Resumen de Contexto del Proyecto — Dashboard

Documento de handoff para continuar el desarrollo del dashboard en un chat nuevo de Cursor.  
Última actualización basada en el estado del repo y la conversación hasta mayo 2026.

---

## 1. Visión General del Proyecto

- **Nombre del proyecto:** `globalscoreagent-web` (Global Score Agent)
- **Objetivo principal del dashboard:** Panel autenticado (`/dashboard/*`) para explorar, filtrar y analizar agentes del ecosistema **ERC-8004**, con métricas de reputación **HUMI** (agente) y **WAMI** (wallet), estadísticas globales por cadena, y vistas de detalle ricas (pilares, warnings, on-chain, metadata, etc.).
- **Estado actual del desarrollo:** Aproximadamente **70–75%** del dashboard funcional core.
  - **Avanzado:** overview principal, directorio de agentes con filtros/sort, detalle de agente, detalle HUMI por agente, suscripciones/perfil, APIs server-side con auth.
  - **En migración activa:** tablas legacy → vistas materializadas (marketing y dashboard).
  - **Pendiente / parcial:** migraciones DB restantes, WAMI como página dedicada, limpieza de helpers legacy, índices SQL en Supabase, cobertura de tests.

---

## 2. Stack Tecnológico

- **Framework:** Next.js **14.2.15** (App Router), React **18.3**, TypeScript **5**
- **Base de datos:** **Supabase (PostgreSQL)** vía `@supabase/supabase-js` y `@supabase/ssr`
  - **No hay ORM** (Prisma/Drizzle). Consultas directas con cliente Supabase en API routes.
  - Paquete `pg` presente en dependencias; el dashboard no lo usa como capa principal visible en el código analizado.
- **UI y visualización:**
  - **Tailwind CSS 3.4**
  - **Recharts** (gráficos: nonce, tendencias, pilares)
  - **Framer Motion** (animaciones)
  - **Lucide React** (iconos)
  - **Radix UI** (avatar, dropdown)
  - **Three.js / R3F** (presente en deps; uso principal parece marketing/3D, no core dashboard)
- **Auth:** Supabase Auth + `requireDashboardUser()` en APIs dashboard
- **Deployment:** **No confirmado explícitamente** en la conversación (típicamente Vercel u hosting Next.js). Scripts: `next build`, `next start`.

---

## 3. Estructura de Carpetas y Archivos Clave

```
globalscoreagent-web/
├── app/
│   ├── (dashboard)/dashboard/          # UI del dashboard (rama dashboard-final)
│   │   ├── page.tsx                    # Home dashboard (overview)
│   │   ├── agents/
│   │   │   ├── page.tsx                # Directorio de agentes
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Detalle agente
│   │   │       └── humi/page.tsx       # Detalle índice HUMI
│   │   ├── humi/page.tsx               # HUMI por query ?agentId=
│   │   ├── perfil/, subscripciones/, uso/, api/
│   │   └── components/                 # Layout, i18n, login, sidebar
│   └── api/
│       ├── dashboard/                  # APIs autenticadas
│       │   ├── overview/route.ts       # Stats globales + chains
│       │   ├── agents/route.ts         # Listado/filtros
│       │   ├── agents/[id]/route.ts    # Detalle agente
│       │   ├── agents/[id]/humi/route.ts
│       │   ├── profile/, subscriptions/
│       └── web-page/statistics/        # KPIs marketing (rama web-page-v2)
├── components/dashboard/               # ~42 componentes (cards, charts, carousels)
├── lib/                                # Parsers, scoring display, filtros, series
├── docs/
│   ├── BRANCHING.md                    # Convivencia marketing vs dashboard
│   ├── español/index-humi.md           # Spec madurez HUMI
│   └── sql/                            # MVs, imports, índices PostgreSQL
└── utils/supabase/                     # Clientes SSR/browser (compartido)
```

**Más avanzados:**

- `dashboard/page.tsx` + `overview` API
- `agents/page.tsx` + `agents/route.ts`
- `agents/[id]/page.tsx` + APIs asociadas
- `agents/[id]/humi/page.tsx` y `dashboard/humi/page.tsx`
- Componentes en `components/dashboard/` (pilares HUMI, chain cards, warnings, on-chain)

**Menos avanzados / placeholder:**

- `dashboard/uso/page.tsx`, `dashboard/api/page.tsx` (existen; alcance funcional no detallado en conversación)

---

## 4. Funcionalidades Implementadas

### Overview (`/dashboard`)

- Carrusel de 4 KPIs globales: agentes registrados, activos, con feedback, wallets monitoreadas
- Card de **nonce** (serie 30 días) vía `agent_nonce`
- Card de **distribuciones** HUMI / WAMI / metadata richness
- Carrusel de **cadenas** (`DashboardChainCards`): stats 30d, mensual, HUMI/WAMI/metadata, top 10 agentes, warnings, on-chain

### Directorio de agentes (`/dashboard/agents`)

- Búsqueda, filtros avanzados (`agent_advanced_filters`), filtros por cadena/tags/skills
- Filtro **Index HUMI** por `humi_madurity_level` (madurez nueva: Unstable → Elite + Not Calculated)
- Sort por score HUMI, nonce, balance, fecha, nombre
- Paginación infinita
- Ribbon de madurez HUMI en cards (`AgentDirectoryHumiRibbon`)
- Normalización: `current_humi_score` NULL → `0`; `humi_madurity_level` NULL → `"Not Calculated"`

### Detalle de agente (`/dashboard/agents/[id]`)

- Cards HUMI/WAMI con madurez nueva (`getHumiMaturityColor/Text`)
- Metadata richness, warnings, owner wallet, wallets transaccionales
- Gráficos nonce/balance delta, on-chain, feedback, attestations, audits, protocol activity
- Navegación reciente entre agentes

### Detalle HUMI (`/dashboard/agents/[id]/humi` y `/dashboard/humi?agentId=`)

- Score card con `madurity_level`
- Cards de **4 pilares** (history, usage, measure, information)
- Tendencias 30 días y tracking mensual por pilar
- Resúmenes JSON (`pillar_*_summary`) parseados en frontend

### Cuenta y suscripción

- Perfil (`/api/dashboard/profile`)
- Suscripciones y resumen de plan
- Login gate + verificación de suscripción activa (`DashboardLoginContext`)

### Marketing (rama `web-page-v2`, relacionado)

- KPI overlays home/HUMI/WAMI vía `/api/web-page/statistics` → MV `web_page.global_score_agent_summary`
- Waitlist operativa

---

## 5. Lógica de Scoring (HUMI y WAMI)

### HUMI (Agent Human-like Metrics Index)

- **Cálculo en PostgreSQL**, no en frontend.
- Esquema upstream: `index_humi` (funciones/MVs documentadas en `docs/sql/index_humi_*`)
- **4 pilares**, máx. 25 pts c/u → score total 0–100:
  - History, Usage, Measure, Information
- Datos en dashboard: `web_dashboard.index_humi` (import desde MVs vía `web_dashboard_index_humi_import_data.sql`)
- **Madurez (nueva):** Unstable (0–49), Developing (50–64), Stable (65–79), Very Stable (80–89), Elite (90–100)
  - Campo DB: `madurity_level` / `humi_madurity_level` en agentes
  - Spec: `docs/español/index-humi.md`
- Frontend: **solo presenta** scores, colores, filtros y parsers (`lib/agentHumiDisplay.ts`, `lib/indexHumi.ts`)

### WAMI (Wallet Agent Maturity Index)

- También **pre-calculado en BD** (`index_wami`, imports en `docs/sql/`)
- Misma escala de madurez que HUMI
- En detalle agente: `current_wami_score`, `wami_madurity_level` normalizados en API
- Distribución WAMI global en overview desde `global_stadistics.wami_index_distribution`
- **No hay** página dedicada WAMI equivalente a HUMI detail confirmada como completa

### Dónde vive el “cálculo” vs “visualización”

| Capa | Responsabilidad |
|------|-----------------|
| PostgreSQL MVs/funciones | Cálculo, agregación, import batch |
| API routes (`app/api/dashboard/**`) | Auth, select, normalización mínima |
| `lib/*` parsers | JSON → tipos UI, series, colores |
| Componentes React | Charts, cards, filtros, i18n |

---

## 6. Decisiones de Diseño y Arquitectura Importantes

### UI/UX

- **Modo oscuro/claro** vía `LanguageContext` (`theme: 'dark' | 'light'`)
- **i18n ES/EN** centralizado en `LanguageContext.tsx` (traducciones extensas)
- Paleta de madurez unificada en `lib/dashboardMaturityDistribution.ts`
- Cards reutilizables: `AgentDetailCard` con variantes/accent colors
- Layout dashboard: sidebar + top nav; títulos dinámicos por ruta
- Responsive con grids Tailwind (`lg:grid-cols-12`, carousels)

### Arquitectura

- **Datos sensibles vía API server**, no Supabase directo desde browser en overview (migrado a `/api/dashboard/overview`)
- Auth: `requireDashboardUser()` en todas las APIs dashboard
- **Monorepo dual-producto** con ramas separadas (`web-page-v2` vs `dashboard-final`)
- Parsers JSON defensivos (`normalizeJsonField`, `coerceNumber`, guards de null)
- Cambios **mínimos y focalizados**; reutilizar helpers existentes

### Patrones

- Tipos de dominio en `lib/` (`DashboardChainRow`, `IndexHumiCardData`)
- API responses: `{ success, data/error, details? }`
- `dynamic = 'force-dynamic'` en rutas que leen BD

---

## 7. Integración con Base de Datos

### Esquema `web_dashboard` (dashboard)

| Objeto | Uso |
|--------|-----|
| `global_stadistics` (MV) | Stats globales overview — **migrado** desde `main_stadistics` |
| `chains_stadistics` (MV) | Stats por cadena — **migrado** desde `chains`; PK `id` mapeado a `chain_id` en API |
| `agents` | Directorio y detalle de agentes |
| `agent_advanced_filters` | Config de filtros avanzados |
| `index_humi` | Detalle HUMI por agente |

### Esquemas upstream (vía MVs / imports)

- `erc_8004.*` — agentes, chains, wallets, summary MVs
- `index_humi.*` — `summary_humi_index`, pillar calculations
- `index_wami.*` — `summary_wami_index`, wallet cohorts

### Esquema `web_page` (marketing, rama web-page-v2)

- `global_score_agent_summary` (MV) — KPIs públicos main/humi/wami
- `waitlist` — formulario waitlist
- Tablas legacy **eliminadas del código:** `web_page_statistics`, `erc_8004_statistics`, `erc_8004_agent_statistics`, `index_humi_agent_distribution`

### Flujo de datos overview (estado actual)

```
/dashboard/page.tsx
  → GET /api/dashboard/overview (auth cookie)
    → web_dashboard.global_stadistics (latest by calculated_at)
    → web_dashboard.chains_stadistics (map id → chain_id)
  → StatsNavigator, DashboardNonceInsightCard, DashboardGlobalDistributionCard, DashboardChainCards
```

### Pendiente de migración DB en código

- `app/api/dashboard/agents/[id]/route.ts` aún usa `.from('chains')` para logos/nombres de cadena

---

## 8. Próximos Pasos / Tareas Pendientes

### Prioridad alta (migración DB dashboard)

1. Migrar `agents/[id]/route.ts`: `chains` → `chains_stadistics` con mapeo `id` → `chain_id`
2. Confirmar en Supabase: `REFRESH` de MVs upstream + `GRANT SELECT` + schema `web_dashboard` expuesto
3. Ejecutar índices SQL si no se aplicaron: `db/indexes_web_dashboard_agents_humi_madurity_level.sql` (filtro Not Calculated)

### Prioridad media (calidad / consistencia)

4. Actualizar `ChainTopAgentsList` — aún usa `humiFilterFromNumericScore` (legacy) en lugar de madurez nueva
5. Revisar `lib/dashboardChains.ts` helpers deprecated
6. Import HUMI si scores null: `web_dashboard.web_dashboard_index_humi_import_data()`
7. Sincronizar ramas `dashboard-final` y `web-page-v2` tras cambios en archivos compartidos (`utils/supabase/*`, `package.json`)

### Prioridad baja / futuro

8. Página WAMI dedicada (si se requiere paridad con HUMI)
9. Tests automatizados (no existen para APIs dashboard)
10. Actualizar docs: `docs/BRANCHING.md`, `docs/supabase-dashboard-access.sql` (referencias a tablas viejas)
11. Otras páginas dashboard (`uso`, `api`) — alcance por definir

---

## 9. Reglas y Preferencias a Respetar

### Ramas (`docs/BRANCHING.md`)

- **Dashboard:** rama `dashboard-final` — no tocar landing/marketing salvo shared acordado
- **Marketing:** rama `web-page-v2` — no tocar `app/(dashboard)/**` ni `components/dashboard/**`
- Archivos **compartidos** (`package.json`, `utils/supabase/*`, `app/layout.tsx`, `next.config.js`, etc.): cambios aditivos; avisar merge de `main` a la otra rama

### Código

- TypeScript **strict**
- Next.js 14 App Router — consultar guías en `node_modules/next/dist/docs/` si hay dudas de API
- **Diffs mínimos**; no refactorizar código no relacionado
- Reutilizar convenciones existentes (naming, imports `@/`, parsers en `lib/`)
- Comentarios solo para lógica no obvia
- **No crear commits** salvo petición explícita del usuario

### Estilo de trabajo

- Prosa clara, técnica pero accesible
- Ejecutar comandos y verificar en entorno real; no asumir éxito sin evidencia

---

## 10. Contexto Adicional Relevante

### Migraciones recientes completadas

**Marketing (`web-page-v2`):**

- `/api/web-page/statistics` → `web_page.global_score_agent_summary`
- Eliminadas APIs legacy: `/api/erc8004/*`, `/api/humi/market-index`

**Dashboard (`dashboard-final`):**

- `/api/dashboard/overview` → `global_stadistics` + `chains_stadistics`
- Eliminado fetch legacy `/api/erc8004/chains` en `DashboardLayoutClient`
- Eliminado `useDashboardStats`; contador de agentes viene de `/api/dashboard/agents`

### Madurez HUMI — cambio de modelo

- **Antes:** `humi_score_filter` / categorías legacy (Critical, Moderate Risk, etc.)
- **Ahora:** `humi_madurity_level` con tiers Unstable…Elite + Not Calculated
- Filtro Not Calculated: `.is('humi_madurity_level', null)` (no `.or()` con strings)
- Sort HUMI: `nullsFirst: false` para que NULL no aparezcan primero en DESC

### Normalización en APIs

- `normalizeAgentHumiScore` / `normalizeAgentWamiMaturity` en `lib/agentHumiDisplay.ts`
- `resolveHumiCategory(madurityLevel, legacyCategory, score)` en `lib/indexHumi.ts`

### SQL útil en repo (referencia, no runtime)

- `docs/sql/web_dashboard_global_stadistics.sql`
- `docs/sql/web_dashboard_chains.sql` (MV `chains`; en BD del usuario puede llamarse `chains_stadistics`)
- `docs/sql/web_page_global_score_agent_summary.sql`
- `docs/sql/generate_humi_executive_summary_optimized.sql`

### Lo que requiere confirmación en nuevo chat

- Porcentaje exacto de completitud del producto
- Plataforma de deployment concreta
- Estado en producción de todas las MVs (si están refrescadas y con grants)
- Roadmap oficial de páginas `uso` y `api` del dashboard

---

## 11. Instrucciones para agentes Cursor (handoff)

> **Reglas generales consolidadas:** [`docs/AGENT-RULES.md`](AGENT-RULES.md) — leer primero en cualquier chat nuevo.

No hace falta configurar permisos especiales de ruta: cualquier agente en este workspace **ya puede leer** los archivos del repo. Lo importante es indicarle **dónde mirar** y **qué limitaciones hay**, porque la estructura de la BD no está en un solo archivo.

### Dónde está la estructura de la base de datos

| Ubicación | Qué contiene |
|-----------|----------------|
| `docs/dashboard-context-summary.md` (este archivo) | Contexto del dashboard, tablas/MVs en uso, migraciones |
| `docs/sql/` | Definiciones de MVs, funciones, imports (`global_stadistics`, `chains`, HUMI/WAMI, etc.) |
| `db/` | Índices SQL puntuales (p. ej. `indexes_web_dashboard_agents_humi_madurity_level.sql`) |
| `docs/supabase-auth-setup.md` | Schemas expuestos, grants, RLS |
| `docs/BRANCHING.md` | Schemas por zona (dashboard vs marketing) |
| `app/api/dashboard/**` | **Fuente de verdad práctica**: qué tablas/vistas consume el código hoy |

### Prompt sugerido para un chat nuevo

Copiar y pegar al iniciar la sesión:

```text
Antes de tocar la BD o las APIs del dashboard:
1. Lee docs/dashboard-context-summary.md
2. Para estructura SQL (MVs, columnas, refresh), busca en docs/sql/ los archivos relevantes
   (p. ej. web_dashboard_global_stadistics.sql, web_dashboard_chains.sql)
3. Confirma en app/api/dashboard/** qué .from('...') usa el código actual
4. La BD real puede diferir del SQL del repo (p. ej. chains_stadistics vs chains)
5. Trabaja en rama dashboard-final; no modifiques marketing salvo shared acordado
```

### Lo que el agente no tiene automáticamente

- **Conexión live a Supabase** (inspeccionar tablas reales del proyecto): requiere `.env.local` y ejecución manual en SQL Editor o APIs locales; el agente no accede a Supabase por sí solo.
- **Schema dump único**: no existe un `schema.sql` completo; hay que cruzar `docs/sql/` + APIs + lo desplegado en Supabase.

### Archivos SQL frecuentes por tarea

| Tarea | Archivo en `docs/sql/` |
|-------|-------------------------|
| Stats globales dashboard | `web_dashboard_global_stadistics.sql` |
| Stats por cadena | `web_dashboard_chains.sql` (en BD puede ser `chains_stadistics`) |
| Import agentes | `web_dashboard_agents_import_data.sql` |
| Import HUMI | `web_dashboard_index_humi_import_data.sql` |
| KPIs marketing | `web_page_global_score_agent_summary.sql` |
| Spec madurez HUMI | `docs/español/index-humi.md` |
| Acceso Supabase / RLS | `docs/supabase-auth-setup.md`, `docs/supabase-dashboard-access.sql` |
