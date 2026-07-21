# Global Score Agent — Public API HUMI (Demo / Hackathon)

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Tipo:** Documentación técnica  
**Alcance:** Endpoint demo para Ethereum Uruguay Hackathon 2026 (sin consumo de créditos)

---

## 1. Introducción

Endpoint de **análisis HUMI completo** para un agente identificado por `canonical_slug` (mismo valor que Free Tier / `on_chain_id`).

- **Auth:** `Authorization: Bearer <secreto>` (env Supabase `GSA_HUMI_DEMO_SECRET`). No hay cobro de créditos.
- **Infra:** Cloudflare Worker `gsa-api-router` → Edge Function `api-demo-agent-humi`.
- **Walcert (demo):** `canonical_slug=celo-9699` (agentId 9699 en Celo).

---

## 2. Endpoint

```http
GET https://api.globalscoreagent.com/v1/agents/humi
```

### Parámetros de consulta

| Parámetro        | Tipo   | Obligatorio | Default | Descripción                          |
|------------------|--------|-------------|---------|--------------------------------------|
| `canonical_slug` | string | Sí          | —       | Identificador del agente (Free Tier) |
| `lang`           | string | No          | `eng`   | `eng` o `esp` (textos de madurez)    |

### Headers

| Header            | Valor                         |
|-------------------|-------------------------------|
| `Authorization`   | `Bearer <GSA_HUMI_DEMO_SECRET>` |
| `Accept`          | `application/json`            |

### Ejemplo curl

```bash
curl -sS "https://api.globalscoreagent.com/v1/agents/humi?canonical_slug=celo-9699&lang=eng" \
  -H "Authorization: Bearer TU_SECRETO" \
  -H "Accept: application/json"
```

Directo a Supabase (sin Worker), útil para smoke test:

```bash
curl -sS "https://mezqyworblseixaypftg.supabase.co/functions/v1/api-demo-agent-humi?canonical_slug=celo-9699&lang=eng" \
  -H "Authorization: Bearer TU_SECRETO" \
  -H "Accept: application/json"
```

---

## 3. Respuesta exitosa (200)

```json
{
  "success": true,
  "data": {
    "agent": {
      "canonical_slug": "celo-9699",
      "name": "...",
      "description": "...",
      "agent_warnings": [],
      "ai_category_primary": "...",
      "ai_category_purpose": "...",
      "ai_category_confidence": 0.9,
      "metadata_richness_score": 0,
      "metadata_richness_category": "...",
      "realness_status": "...",
      "realness_score": 0
    },
    "humi": {
      "score": 17.5,
      "madurity_level": "Unstable",
      "calculated_at": "2026-07-20T22:36:00.033249+00:00",
      "summary": {
        "user_description": "...",
        "confidence_level": "...",
        "risk": "..."
      },
      "pillars": {
        "history": { "score": 0, "summary": {} },
        "information": { "score": 0, "summary": {} },
        "measure": { "score": 0, "summary": {} },
        "usage": { "score": 0, "summary": {} }
      }
    }
  }
}
```

### Notas de campos

- `agent.canonical_slug` = `web_dashboard.agents.on_chain_id` (mismo campo que Free Tier).
- `humi.summary` proviene de `index_madurity_details` (`index=humi`, nivel del agente), localizado por `lang`.
- `humi.pillars.*.summary` es el JSONB de `index_humi` (executive summary + bloques/items).
- `agent_warnings` sin `score_impact`.

---

## 4. Errores

| Status | Caso |
|--------|------|
| 401 | Falta Bearer o secreto incorrecto |
| 400 | Falta `canonical_slug`, agente no encontrado, o sin fila HUMI |
| 429 | Rate limit Worker (20 req/min/IP) |
| 404 | Path desconocido en el Worker |

---

## 5. Deploy Cloudflare (checklist)

El Worker vive en el repo **[public-api](https://github.com/GlobalScoreAgent/public-api)** (`gsa-api-router`).

1. Edge Function `api-demo-agent-humi` desplegada + secret `GSA_HUMI_DEMO_SECRET` en Supabase.
2. En `public-api`: ruta `humi` en `src/index.js` + pattern en `wrangler.toml`.
3. Conectar el repo a Workers Builds (recomendado) o `wrangler deploy`.
4. Curl E2E al host público (ver `docs/DEPLOY-HUMI-DEMO.md` en `public-api`).

---

## 6. Relación Free Tier

| Endpoint | Auth | Detalle |
|----------|------|---------|
| `/v1/agents/search` | Ninguna | Descubrimiento → obtén `canonical_slug` |
| `/v1/agents/maturity` | Ninguna | Labels HUMI/WAMI básicos |
| `/v1/agents/humi` | Bearer demo | Análisis HUMI completo (este doc) |

---

**Documento de demo.** El secreto no debe exponerse en frontends públicos; solo en la app del hackathon (server-side).
