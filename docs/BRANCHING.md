# Estrategia de ramas — Web oficial vs Dashboard

Este repositorio aloja **dos productos** en un solo monorepo Next.js.

## Ramas (julio 2026)

| Rama | Propósito | Estado |
|------|-----------|--------|
| **`main`** | Producción — marketing + dashboard | **Activa** (Vercel: `www.globalscoreagent.com`) |
| Feature branches | Trabajo acotado (p. ej. `dashboard-movil`) | PR → merge a `main` |
| `web-page-v2` | Landing / marketing | Histórica (mergeada en `main`) |
| `dashboard-final` | Dashboard pre-producción | Histórica (mergeada en `main`) |

**Regla actual:** trabajar en **`main`** o en una **feature branch** corta → PR → `main`. No abrir trabajo diario nuevo en `web-page-v2` / `dashboard-final` salvo recuperación histórica.

## Zonas del código

### Solo marketing

- `app/page.tsx`, `app/humi/`, `app/wami/`, `app/legal/`, `app/waitlist/`, `app/pricing/`, `app/docs/`, …
- `app/api/web-page/`
- `components/marketing/`
- Redirects legacy en `next.config.js` según config actual

### Solo dashboard

- `app/(dashboard)/dashboard/**`
- `components/dashboard/**` (incl. `components/dashboard/chain/**`)
- `app/api/dashboard/**`
- `lib/**` orientado a dashboard (p. ej. `dashboardChainCardData.ts`, parsers HUMI/WAMI)

### Compartido (coordinación obligatoria)

Cambios aquí afectan marketing y dashboard. Preferir cambios **aditivos**.

| Archivo / carpeta | Notas |
|-------------------|--------|
| `package.json`, `package-lock.json` | Nuevas deps: acordar |
| `utils/supabase/*` | Clientes Supabase SSR/browser |
| `app/layout.tsx`, `app/globals.css` | Layout raíz |
| `next.config.js`, `tailwind.config.js`, `tsconfig.json` | Config global |
| `.env.example` | Documentar variables; nunca commitear `.env` |

## Flujo recomendado

```
feature-branch ──PR──► main (producción / Vercel)
```

1. Cambio solo dashboard o solo marketing → feature branch → PR a `main`.
2. Cambio shared pequeño → PR a `main` pronto; avisar en la descripción.
3. Evitar editar el mismo archivo shared en dos features el mismo día sin sincronizar.

## APIs

- **Públicas (marketing):** `app/api/web-page/**` — schema `web_page` / lectura pública.
- **Dashboard:** `app/api/dashboard/**` — `requireDashboardUser()`, schema `web_dashboard` (+ `gsa` para suscripciones).

No mover rutas de API entre zonas sin actualizar esta doc y [`docs/AGENT-RULES.md`](AGENT-RULES.md).

## Responsive dashboard

Corte **`md` (768px)**. Overview y chain cards tienen árboles separados móvil/desktop. Detalle: [`docs/dashboard-context-summary.md`](dashboard-context-summary.md).
