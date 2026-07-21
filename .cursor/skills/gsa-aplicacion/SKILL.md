---
name: gsa-aplicacion
description: >-
  Loads Global Score Agent web app context (marketing landing and/or authenticated
  dashboard) before coding: zone rules, vault map, repo docs, and production
  pitfalls. Use when working on the main site, landing, pricing, public agents,
  /dashboard, agents directory, overview, subscriptions, monorepo
  globalscoreagent-web UI/API, or when the user mentions gsa-aplicacion.
---

# GSA Aplicación — onboarding de contexto

Checklist obligatorio **antes** de editar marketing o dashboard en `globalscoreagent-web`.

## 1. Identificar zona

| Zona | Señales | No tocar (salvo pedido) |
|------|---------|-------------------------|
| **Marketing** | `/`, `/humi`, `/wami`, `/pricing`, `/agents/[id]` público, `app/api/web-page/` | `app/(dashboard)/**`, `components/dashboard/**` |
| **Dashboard** | `/dashboard/*`, `app/api/dashboard/` | Landing y rutas marketing |
| **Shared** | `utils/supabase/*`, `app/layout.tsx`, `middleware.ts`, `next.config.js`, `package.json` | Cambios grandes sin coordinar; preferir **aditivos** |

Detalle: [docs/BRANCHING.md](../../../docs/BRANCHING.md).

Prod: rama **`main`** → Vercel `https://www.globalscoreagent.com`. Feature → PR → `main`.

## 2. Mapa operativo (Obsidian)

Si el MCP **`user-obsidian`** está disponible:

1. Leer `01 - Aplicación/Índice.md`
2. Según zona: `01 - Aplicación/Marketing/Índice.md` o `01 - Aplicación/Dashboard/Índice.md`
3. Abrir la nota de pantalla concreta si la tarea es acotada (p. ej. Directorio, Overview)

Si no hay MCP: continuar con los docs del repo (§3). Mapa completo en [reference.md](reference.md).

## 3. Docs del repo (siempre)

1. Leer [docs/AGENT-RULES.md](../../../docs/AGENT-RULES.md)
2. **Dashboard** → [docs/dashboard-context-summary.md](../../../docs/dashboard-context-summary.md)
3. **Marketing** → [docs/marketing-web-context-summary.md](../../../docs/marketing-web-context-summary.md)

## 4. Confirmar datos en código

No asumir que `docs/sql/` = Supabase 1:1.

- Marketing: `.from('...')` en `app/api/web-page/**` (schema `web_page`)
- Dashboard: `app/api/dashboard/**` (schema `web_dashboard`, + `gsa` billing)
- Auth dashboard: `requireDashboardUser()`; rutas gated también suscripción activa
- Overview: JWT **`authenticated`** (no `service_role`)

## 5. Pitfalls (no olvidar)

| Síntoma / tema | Qué hacer |
|----------------|-----------|
| Overview “sin conexión” | Revisar **403/GRANT** en `chains_stadistics` / `global_stadistics`, no asumir caída de BD |
| Filtro Chains lento / 500 timeout | Filtrar por **`chain_id`**, no `ILIKE` masivo en `chain_name` |
| Responsive dashboard | Corte **`md` (768px)**; overview y chains tienen UI móvil vs desktop |
| Diff / git | Diff mínimo; **no** commit/push salvo petición explícita |

Más detalle: [reference.md](reference.md).

## 6. Tras cargar contexto

Implementar solo el alcance pedido. Si la tarea cruza marketing + dashboard + shared, confirmar con el usuario antes de tocar shared.
