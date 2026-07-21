# Reglas generales para agentes Cursor — Global Score Agent

Documento maestro de convenciones, arquitectura y estado del proyecto.  
Úsalo al **iniciar cualquier chat nuevo** antes de implementar cambios.

**Última revisión:** julio 2026 — producción en `main` + dashboard móvil mergeado.

**Documentos complementarios (leer según la tarea):**

| Documento | Cuándo leerlo |
|-----------|----------------|
| Skill [`.cursor/skills/gsa-aplicacion/`](.cursor/skills/gsa-aplicacion/SKILL.md) | Onboarding marketing/dashboard (checklist + vault `01 - Aplicación`) |
| [`docs/dashboard-context-summary.md`](dashboard-context-summary.md) | Dashboard (incl. responsive móvil/desktop), APIs, MVs, grants |
| [`docs/marketing-web-context-summary.md`](marketing-web-context-summary.md) | Web pública: landing, pricing, KPIs, docs, agentes públicos |
| [`docs/BRANCHING.md`](BRANCHING.md) | Zonas del monorepo y archivos compartidos |
| [`docs/español/index-humi.md`](español/index-humi.md) | Spec de madurez HUMI y pilares |
| [`docs/supabase-auth-setup.md`](supabase-auth-setup.md) | Auth, schemas expuestos, RLS, grants |

---

## 1. Inicio de sesión — checklist obligatorio

Antes de tocar código o BD:

1. **Identificar la zona:** ¿marketing o dashboard? (trabajo diario en **`main`** o feature branch → PR → `main`)
2. **Aplicar skill `gsa-aplicacion`** (o seguir su checklist) si el trabajo es UI/API de marketing o dashboard.
3. **Leer** [`docs/dashboard-context-summary.md`](dashboard-context-summary.md) si el trabajo es del dashboard.
4. **Confirmar en código** qué tablas/vistas usa hoy la API: `app/api/dashboard/**` o `app/api/web-page/**`.
5. **Buscar definición SQL** en `docs/sql/` si hay migración o duda de columnas.
6. **No asumir** que el SQL del repo coincide 1:1 con Supabase (nombres pueden diferir, p. ej. `chains_stadistics`).
7. **Diff mínimo:** solo el alcance pedido; no refactorizar código ajeno.

### Prompt rápido para pegar en chat nuevo

```text
Usa la skill gsa-aplicacion. Lee docs/AGENT-RULES.md y el contexto según zona:
- Dashboard → docs/dashboard-context-summary.md
- Web marketing → docs/marketing-web-context-summary.md
Producción en main (www.globalscoreagent.com). Feature → PR → main.
BD: docs/sql/ + app/api/** como fuente práctica (Supabase puede diferir).
Dashboard responsive: corte md (768px); overview y chains tienen UI móvil vs desktop.
Overview usa JWT authenticated (no service_role). Si la UI dice "sin conexión",
revisar 403/GRANT en chains_stadistics antes de asumir caída de BD.
```

---

## 2. Ramas y zonas del código

Monorepo con **dos productos** en un solo Next.js. Detalle en [`docs/BRANCHING.md`](BRANCHING.md).

| Rama | Alcance |
|------|---------|
| **`main`** | **Producción** — marketing + dashboard (incl. UX móvil) |
| `web-page-v2` | Histórico marketing (mergeado) |
| `dashboard-final` / `dashboard-movil` | Histórico / feature mergeadas; no usar como default |

### Reglas de zona

- **Marketing:** no modificar `app/(dashboard)/**` ni `components/dashboard/**`.
- **Dashboard:** no modificar `app/page.tsx`, `app/humi/`, `app/wami/`, etc., salvo petición explícita.
- **Compartido** (coordinar antes de cambios grandes): `package.json`, `utils/supabase/*`, `app/layout.tsx`, `app/globals.css`, `next.config.js`, `tailwind.config.js`, `.env.example`.
  - Cambios **aditivos**; no eliminar código ajeno.
  - Tras tocar shared: PR a `main`; otras features deben actualizarse desde `main`.

### APIs por zona

| Zona | Rutas | Schema BD típico |
|------|-------|------------------|
| Marketing | `app/api/web-page/` | `web_page` |
| Dashboard | `app/api/dashboard/**` | `web_dashboard`, imports desde `erc_8004`, `index_humi`, `index_wami` |

---

## 3. Base de datos — dónde está la estructura

No hay un único `schema.sql`. La estructura se reparte así:

| Ubicación | Contenido |
|-----------|-----------|
| `docs/sql/` | MVs, funciones PostgreSQL, imports, índices |
| `db/` | Índices puntuales (p. ej. `humi_madurity_level`) |
| `app/api/**` | Qué `.from('...')` consume el runtime hoy |
| Supabase (manual) | Estado real, REFRESH de MVs, grants, RLS |

### El agente no tiene acceso automático a Supabase live

- Requiere `.env.local` y pruebas locales o SQL Editor / MCP del usuario.
- Validar permisos: **Project Settings → API → Exposed schemas** debe incluir `web_dashboard` (y `web_page` / `gsa` según caso).

### Estado de migraciones (tablas → vistas materializadas)

**Marketing (`web_page`):**

| Antes (legacy) | Ahora (MV) | API |
|----------------|------------|-----|
| `web_page_statistics` | `global_score_agent_summary` | `/api/web-page/statistics` |
| `erc_8004_*`, `index_humi_agent_distribution` | — | APIs eliminadas del código |

**Dashboard (`web_dashboard`):**

| Antes (legacy) | Ahora (MV/vista) | API | Notas |
|----------------|------------------|-----|-------|
| `main_stadistics` | `global_stadistics` | `/api/dashboard/overview` | `order calculated_at desc limit 1` |
| `chains` | `chains_stadistics` | `/api/dashboard/overview` | PK `id` → mapear a `chain_id` en respuesta |
| `chains` | `chains_stadistics` | `/api/dashboard/agents/[id]` | **Pendiente migrar** |

### Grants tras REFRESH (crítico)

Overview carga **en paralelo** `global_stadistics` + `chains_stadistics` con el JWT `authenticated`.  
Si `chains_stadistics` pierde `GRANT SELECT` (p. ej. tras recreate MV), PostgREST responde **403** y la UI muestra «sin conexión» (falso positivo).

```sql
GRANT SELECT ON web_dashboard.chains_stadistics TO authenticated, anon, authenticator;
-- Verificar también global_stadistics
```

### Archivos SQL frecuentes

| Tarea | Archivo |
|-------|---------|
| Stats globales dashboard | `docs/sql/web_dashboard_global_stadistics.sql` |
| Stats por cadena | `docs/sql/web_dashboard_chains.sql` |
| KPIs marketing | `docs/sql/web_page_global_score_agent_summary.sql` |
| Import agentes / HUMI / WAMI | `docs/sql/web_dashboard_agents_import_data.sql`, etc. |
| Proceso diario | `docs/sql/web_dashboard_daily_process.sql` |

---

## 4. Convenciones de código

### Stack

- **Next.js 14.2** App Router — ver `node_modules/next/dist/docs/` ante dudas (APIs pueden diferir del training data).
- **TypeScript strict**
- **Supabase JS** directo (sin ORM)
- **Tailwind** + **Recharts** + **Framer Motion** en UI dashboard

### Principios

1. **Alcance mínimo** — el cambio más pequeño que resuelva el problema.
2. **Reutilizar** helpers y componentes existentes (`lib/`, `components/dashboard/`).
3. **No over-engineer** — sin abstracciones de una línea ni tests triviales salvo que se pidan.
4. **Comentarios** solo para lógica de negocio no obvia.
5. **Estilo consistente** con el archivo que se edita (espaciado, imports `@/`, nombres).

### Patrones de API dashboard

- Auth: `requireDashboardUser()` en `app/api/dashboard/**`
- Respuesta: `{ success, data?, error?, details? }` vía `apiJsonResponse`
- Rutas dinámicas: `export const dynamic = 'force-dynamic'`
- Datos del overview y listados: **server-side** (no consultar `web_dashboard` desde el browser en páginas ya migradas)

### Git

- **No crear commits** salvo petición explícita del usuario.
- **No push** salvo petición explícita.
- No `git config`, no `--force`, no `--no-verify` sin permiso.

---

## 5. Dashboard — arquitectura UI

### Páginas principales

| Ruta | Datos |
|------|-------|
| `/dashboard` | `GET /api/dashboard/overview` → `global_stadistics` + `chains_stadistics` |
| `/dashboard/agents` | `GET /api/dashboard/agents` + filtros `agent_advanced_filters` |
| `/dashboard/agents/[id]` | `GET /api/dashboard/agents/[id]` |
| `/dashboard/agents/[id]/humi` | `GET /api/dashboard/agents/[id]/humi` → `web_dashboard.index_humi` |

### Responsive (julio 2026)

Corte **`md` = 768px**. Detalle completo en `dashboard-context-summary.md` §4.

- **Shell:** `DashboardMobileNavContext` + drawer en sidebar &lt; md.
- **Overview:** `DashboardOverviewPanels` — árbol `md:hidden` (KPI → Top10 → Nonce → Distribución vertical) vs grid desktop.
- **Chains:** `DashboardChainCards` — móvil: `ChainSelector` + `ChainCardsStack` (Top10 primero); desktop: `ChainDesktopCard` + dots.
- Datos chain compartidos: `lib/dashboardChainCardData.ts`.

### Componentes clave

- `AgentDetailCard` — shell de cards con variantes/accent
- `DashboardChainCards` + `components/dashboard/chain/*` — chains dual móvil/desktop
- `StackedDistributionBar` — `orientation` vertical/horizontal; vertical+`fillHeight` necesita `minHeight`
- `AgentHumiPillar*` — pilares HUMI
- `LanguageContext` — i18n ES/EN + tema dark/light

### Parsers en `lib/`

La lógica de presentación vive en `lib/` (`dashboardChains.ts`, `dashboardChainCardData.ts`, `indexHumi.ts`, `agentHumiDisplay.ts`, series, warnings, metadata). El **cálculo de scores** está en PostgreSQL, no en frontend.

---

## 6. HUMI y WAMI — madurez y normalización

Spec: [`docs/español/index-humi.md`](español/index-humi.md).

### Niveles de madurez (actual)

| Nivel | Rango | Uso en UI |
|-------|-------|-----------|
| Unstable | 0–49 | Filtros, ribbons, colores |
| Developing | 50–64 | |
| Stable | 65–79 | |
| Very Stable | 80–89 | |
| Elite | 90–100 | |
| Not Calculated | `humi_madurity_level` NULL | Badge "Sin calcular" |

### Campos en BD / API

- Directorio: `humi_madurity_level`, `current_humi_score`
- Detalle: `wami_madurity_level`, `current_wami_score`
- `index_humi`: `madurity_level`

### Helpers (`lib/agentHumiDisplay.ts`)

- `normalizeAgentHumiScore(null)` → `0`
- `normalizeAgentHumiMaturity(null)` → `"Not Calculated"`
- `getHumiMaturityColor` / `getHumiMaturityText` — colores y etiquetas
- Filtro Not Calculated: `.is('humi_madurity_level', null)` — **no** usar `.or()` con strings (rompe PostgREST)

### Sort por HUMI

- `nullsFirst: false` en orden DESC para que NULL no queden primero

### Legacy (evitar en código nuevo)

- `humi_score_filter`, categorías Critical/Moderate Risk, `humiFilterFromNumericScore` en `ChainTopAgentsList` — pendiente de limpieza

---

## 7. Scoring — quién calcula qué

| Capa | Responsabilidad |
|------|-----------------|
| PostgreSQL (MVs, funciones en `docs/sql/`) | Cálculo HUMI/WAMI, agregados, imports batch |
| API routes | Auth, SELECT, normalización mínima |
| `lib/*` | Parse JSON, series, colores, tipos |
| React | Visualización, filtros UI, i18n |

**HUMI:** 4 pilares × 25 pts = 100.  
**WAMI:** pre-calculado en `index_wami`; misma escala de madurez en UI.

---

## 8. Tareas pendientes conocidas

Prioridad sugerida (ver también §8 de `dashboard-context-summary.md`):

1. Migrar `app/api/dashboard/agents/[id]/route.ts`: `chains` → `chains_stadistics` (`id` → `chain_id`)
2. Tras REFRESH de MVs: reaplicar GRANT `authenticated` en `chains_stadistics` / `global_stadistics`
3. Alinear API agents con columnas reales (p. ej. errores `nonce_current`)
4. Ejecutar índices: `db/indexes_web_dashboard_agents_humi_madurity_level.sql`
5. Actualizar `ChainTopAgentsList` a madurez nueva (no `humiFilterFromNumericScore`)
6. Tests automatizados (no existen hoy para APIs dashboard)

---

## 9. Qué no hacer

- Mezclar cambios grandes de marketing y dashboard en la misma PR sin plan
- Consultar tablas legacy ya migradas (`web_page_statistics`, `main_stadistics`, `chains` donde ya hay MV)
- Commitear `.env` o secrets
- Inventar columnas o shapes de BD sin revisar `docs/sql/` y las APIs
- Refactors amplios no solicitados
- Editar el plan file (`.cursor/plans/`) salvo que el usuario pida iterar el plan en modo Plan
- Asumir “sin conexión a BD” sin mirar `details` / logs PostgREST (403 grants vs downtime)

---

## 10. Reglas Cursor del repo

Además de este documento, el IDE carga:

- `.cursor/rules/agent-rules.mdc` — **siempre activa**; puntero a este doc
- `.cursor/rules/branch-workflow.mdc` — siempre activa; zonas y shared
- `.cursor/rules/marketing-web-v2.mdc` — globs marketing
- `.cursor/rules/dashboard-branch.mdc` — globs dashboard
- [`AGENTS.md`](../AGENTS.md) — puntero Next.js + ramas

Si una regla de Cursor y este doc difieren, **priorizar la conversación actual del usuario** y luego alinear el doc en Agent mode si hace falta.

---

## 11. Resumen de decisiones recientes

- Overview dashboard lee MVs, no tablas deprecated; JWT `authenticated` only.
- Marketing statistics lee `global_score_agent_summary` (una fila latest).
- Madurez HUMI unificada en directorio, detalle agente y detalle HUMI.
- Dashboard móvil: shell drawer, overview dual, chains dual (`ChainModuleCards` / `ChainDesktopCard`), distribuciones verticales en móvil.
- Handoff: `dashboard-context-summary.md` + este archivo.

---

*Última revisión: julio 2026 — v1 + dashboard móvil en `main`. Actualizar cuando cambien migraciones BD, grants, ramas o convenciones.*
