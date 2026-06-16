<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Ramas y convivencia marketing + dashboard

- **Web oficial:** rama `web-page-v2` — landing, HUMI público, waitlist, SEO.
- **Dashboard:** rama `dashboard-final` — `/dashboard/*`, APIs dashboard.

Detalle de zonas compartidas y flujo de merge: [`docs/BRANCHING.md`](docs/BRANCHING.md).

**Reglas generales para agentes:** [`docs/AGENT-RULES.md`](docs/AGENT-RULES.md) — ramas, BD, migraciones, HUMI/WAMI, convenciones.  
Contexto del dashboard: [`docs/dashboard-context-summary.md`](docs/dashboard-context-summary.md).

Reglas Cursor: `.cursor/rules/` (`agent-rules.mdc` y `branch-workflow.mdc` siempre; reglas por glob para marketing o dashboard).
