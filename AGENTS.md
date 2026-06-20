<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Ramas y convivencia marketing + dashboard

- **Producción (v1):** rama **`main`** — desplegada en `https://www.globalscoreagent.com` (Vercel).
- **Histórico desarrollo:** `web-page-v2` (marketing), `dashboard-final` (dashboard) — mergeadas en `main` (junio 2026).

Detalle de zonas compartidas y flujo de merge: [`docs/BRANCHING.md`](docs/BRANCHING.md).

**Reglas generales para agentes:** [`docs/AGENT-RULES.md`](docs/AGENT-RULES.md) — ramas, BD, migraciones, HUMI/WAMI, convenciones.  
**Contexto dashboard:** [`docs/dashboard-context-summary.md`](docs/dashboard-context-summary.md).  
**Contexto web pública:** [`docs/marketing-web-context-summary.md`](docs/marketing-web-context-summary.md).

Reglas Cursor: `.cursor/rules/` (`agent-rules.mdc` y `branch-workflow.mdc` siempre; reglas por glob para marketing o dashboard).
