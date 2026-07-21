# Deploy checklist — `/v1/agents/humi` (demo)

Orden: **Supabase primero**, luego Cloudflare, luego curl E2E.

## Ya hecho en repo / Supabase

- [x] Edge Function `api-demo-agent-humi` (fuente: `docs/supabase/functions/api-demo-agent-humi/index.ts`)
- [x] Secret `GSA_HUMI_DEMO_SECRET` en el proyecto Supabase
- [x] Snippet Worker actualizado: `docs/cloudflare/api-router-worker.js`
- [x] Route de ejemplo: `docs/cloudflare/wrangler.toml.example`

## Pendiente manual — Cloudflare

1. Abrir Worker **`gsa-api-router`** (host `api.globalscoreagent.com`).
2. Reemplazar/mergear el código con `api-router-worker.js` (entrada `humi` → `api-demo-agent-humi`).
3. Si las routes son por path (no catch-all), añadir:
   - Pattern: `api.globalscoreagent.com/v1/agents/humi*`
   - Zone: `globalscoreagent.com`
4. Save & Deploy (o `wrangler deploy` con el `wrangler.toml` real + KV id).
5. Probar:

```bash
curl -sS "https://api.globalscoreagent.com/v1/agents/humi?canonical_slug=celo-9699&lang=eng" \
  -H "Authorization: Bearer TU_SECRETO" \
  -H "Accept: application/json"
```

Esperado: `200` + `data.agent` + `data.humi`. Sin Bearer → `401`. Path viejo sin deploy → `404`.

## Smoke test sin Worker (ya validado)

```bash
curl -sS "https://mezqyworblseixaypftg.supabase.co/functions/v1/api-demo-agent-humi?canonical_slug=celo-9699&lang=eng" \
  -H "Authorization: Bearer TU_SECRETO"
```
