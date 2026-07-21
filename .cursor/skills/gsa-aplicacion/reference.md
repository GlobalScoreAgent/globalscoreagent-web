# gsa-aplicacion — referencia

Complemento de [SKILL.md](SKILL.md). Leer solo lo necesario para la tarea.

## Vault `01 - Aplicación` (Obsidian)

MCP: `user-obsidian`. Paths relativos a la raíz del vault.

| Nota | Uso |
|------|-----|
| `01 - Aplicación/Índice.md` | Hub marketing + dashboard |
| `01 - Aplicación/Visión del monorepo.md` | Zonas, ramas, shared |
| `01 - Aplicación/Stack y despliegue.md` | Next, Supabase, Vercel |
| `01 - Aplicación/APIs por zona.md` | `web-page` vs `dashboard` |
| `01 - Aplicación/Enlaces al repo.md` | Paths GitHub / docs |
| `01 - Aplicación/Deudas y pendientes.md` | Lista viva |
| `01 - Aplicación/Marketing/Índice.md` | Hub marketing |
| `01 - Aplicación/Marketing/Rutas y páginas.md` | Rutas públicas |
| `01 - Aplicación/Marketing/KPIs y datos públicos.md` | `web_page` KPIs |
| `01 - Aplicación/Marketing/Auth pública y conversión.md` | Login / CTAs |
| `01 - Aplicación/Dashboard/Índice.md` | Hub dashboard |
| `01 - Aplicación/Dashboard/Shell y navegación.md` | Sidebar, móvil |
| `01 - Aplicación/Dashboard/Overview.md` | KPIs, chains, GRANT |
| `01 - Aplicación/Dashboard/Directorio de agentes.md` | Filtros, Chains→`chain_id` |
| `01 - Aplicación/Dashboard/Detalle de agente.md` | Ficha, HUMI/WAMI |
| `01 - Aplicación/Dashboard/Suscripción y gate.md` | Billing / inactive |
| `01 - Aplicación/Dashboard/Perfil e i18n.md` | Tema, idioma |

Core relacionado: `00 - Core/HUMI Index.md`, `WAMI Index.md`, `Estructura del Proyecto.md`.  
BD: `02 - Base de Datos/Índice.md`.

## Docs canónicos del repo

| Doc | Cuándo |
|-----|--------|
| [docs/AGENT-RULES.md](../../../docs/AGENT-RULES.md) | Siempre |
| [docs/dashboard-context-summary.md](../../../docs/dashboard-context-summary.md) | Dashboard |
| [docs/marketing-web-context-summary.md](../../../docs/marketing-web-context-summary.md) | Marketing |
| [docs/BRANCHING.md](../../../docs/BRANCHING.md) | Zonas / shared |
| [docs/supabase-auth-setup.md](../../../docs/supabase-auth-setup.md) | Auth, schemas, grants |
| [docs/español/index-humi.md](../../../docs/español/index-humi.md) | Spec HUMI |
| `docs/sql/` | Definiciones MV / import (puede diferir de prod) |

## Paths UI / API

| Área | Path |
|------|------|
| Dashboard UI | `app/(dashboard)/dashboard/` |
| Dashboard API | `app/api/dashboard/` |
| Marketing UI | `app/page.tsx`, `app/humi/`, `app/wami/`, `app/pricing/`, `app/agents/[id]/`, … |
| Marketing API | `app/api/web-page/` |
| Components dashboard | `components/dashboard/` |
| Components marketing | `components/marketing/` |
| Copy marketing | `content/marketing/`, `content/pricing/` |
| Supabase clients | `utils/supabase/` |

Schemas típicos: marketing → `web_page`; dashboard → `web_dashboard` (+ `gsa` suscripciones).

## Pitfalls ampliados

### Overview

- API: `GET /api/dashboard/overview` → `global_stadistics` + `chains_stadistics`.
- UI error genérico de “sin conexión” suele ser **permission denied / 403** tras REFRESH de MV.
- Reaplicar `GRANT SELECT … TO authenticated` en esas MVs tras recreate.

### Directorio de agentes

- Catálogo UI: `agent_advanced_filters`; no enviar `advancedFilter*` sin valor real.
- Chains: resolver `erc_8004.chains.id` → `agents.chain_id` (índice). Evitar seq scan + count exact en `chain_name`.
- Listas abiertas: `count: estimated`; `hasMore` por tamaño de página.
- Append/infinite scroll no debe abortar el fetch de página 1.
- Labels: `normalizeChainName`; keys = valor BD.

### Responsive

- Corte Tailwind **`md` (768px)**.
- Overview y chain cards: árboles `md:hidden` / `hidden md:flex`.

### Auth / suscripción

- Login: `/auth/login` → `/auth/callback`.
- Gate: suscripción activa; `current_period_end` NULL = activo permanente.
- 401 → unauthorized handler; 403 `subscription_inactive` → notice de gate.

## Deudas conocidas (resumen)

Ver vault `01 - Aplicación/Deudas y pendientes.md` y § pendientes en AGENT-RULES / dashboard-context:

1. `agents/[id]` API: migrar legacy `chains` → `chains_stadistics`
2. GRANT MVs tras cada REFRESH
3. Menú `uso` / `api` incompleto
4. Tags/OASF jsonb / pre-query IDs limit 2000
5. GRANT `authenticated` en `erc_8004.chains` (lookup Chains puede usar admin hoy)
