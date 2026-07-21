# Cloudflare Worker — moved (do not edit here)

El código canónico del router público (`gsa-api-router` / `api.globalscoreagent.com`) vive **solo** en:

**https://github.com/GlobalScoreAgent/public-api**

Ahí: `src/index.js`, `wrangler.toml`, `docs/ARCHITECTURE.md`, `docs/ENDPOINTS.md`, deploy HUMI.

**No** añadir ni restaurar `api-router-worker.js` en este monorepo. Cambios de rutas/rate limit → PR en `public-api`.

Contratos de producto / Edge demo HUMI (aún versionados aquí para `/docs` y deploy Edge):

- `docs/español/public-api-free-tier.md` / `docs/ingles/…`
- `docs/español/public-api-humi-demo.md` / `docs/ingles/…`
- `docs/supabase/functions/api-demo-agent-humi/`

Vault: `01 - Aplicación/Public API/`.
