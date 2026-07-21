<!-- BEGIN:gsa-obsidian-knowledge -->
## Conocimiento org (bóveda Obsidian)

Fuente de verdad de producto/GSA: bóveda Obsidian (`GlobalScoreAgent` en Google Drive), vía **MCP Obsidian** en Cursor.

- Carpeta vault de este repo: **01 - Aplicación**
- Docs técnicos de este repo: **`docs/`**
- Skill onboarding: **`.cursor/skills/gsa-aplicacion/`**
- Decisiones cross-repo: vault **08 - Decisiones**
- Guía canónica: `10 - Agents/AGENTS.md` (stub raíz: `AGENTS.md`)

No inventes definiciones GSA/HUMI/WAMI/Walcert: consulta la bóveda. Español por defecto. Opiniones honestas.
<!-- END:gsa-obsidian-knowledge -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Ramas y convivencia marketing + dashboard

- **Producción:** rama **`main`** — desplegada en `https://www.globalscoreagent.com` (Vercel).
- **Histórico:** `web-page-v2` (marketing), `dashboard-final` (dashboard) — mergeadas en `main` (junio 2026).
- **Feature ejemplo:** `dashboard-movil` mergeada en `main` (julio 2026) — shell responsive, overview dual, chain cards móvil/desktop.

Detalle de zonas compartidas y flujo de merge: [`docs/BRANCHING.md`](docs/BRANCHING.md).

**Reglas generales para agentes:** [`docs/AGENT-RULES.md`](docs/AGENT-RULES.md) — ramas, BD, migraciones, HUMI/WAMI, convenciones, responsive.
**Contexto dashboard:** [`docs/dashboard-context-summary.md`](docs/dashboard-context-summary.md).
**Contexto web pública:** [`docs/marketing-web-context-summary.md`](docs/marketing-web-context-summary.md).
**Skill onboarding app:** [`.cursor/skills/gsa-aplicacion/`](.cursor/skills/gsa-aplicacion/SKILL.md) — checklist marketing/dashboard + mapa vault.

Reglas Cursor: `.cursor/rules/` (`agent-rules.mdc` y `branch-workflow.mdc` siempre; reglas por glob para marketing o dashboard).
