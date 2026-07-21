# Global Score Agent — Public API HUMI (Demo / Hackathon)

**Version:** 1.0  
**Date:** July 2026  
**Type:** Technical documentation  
**Scope:** Demo endpoint for Ethereum Uruguay Hackathon 2026 (no credit consumption)

---

## 1. Introduction

**Full HUMI analysis** endpoint for one agent identified by `canonical_slug` (same value as Free Tier / `on_chain_id`).

- **Auth:** `Authorization: Bearer <secret>` (Supabase env `GSA_HUMI_DEMO_SECRET`). No credit billing.
- **Infra:** Cloudflare Worker `gsa-api-router` → Edge Function `api-demo-agent-humi`.
- **Walcert (demo):** `canonical_slug=celo-9699` (agentId 9699 on Celo).

---

## 2. Endpoint

```http
GET https://api.globalscoreagent.com/v1/agents/humi
```

### Query parameters

| Parameter        | Type   | Required | Default | Description                         |
|------------------|--------|----------|---------|-------------------------------------|
| `canonical_slug` | string | Yes      | —       | Agent id (same as Free Tier search) |
| `lang`           | string | No       | `eng`   | `eng` or `esp` (maturity copy)      |

### Headers

| Header          | Value                            |
|-----------------|----------------------------------|
| `Authorization` | `Bearer <GSA_HUMI_DEMO_SECRET>` |
| `Accept`        | `application/json`               |

### curl example

```bash
curl -sS "https://api.globalscoreagent.com/v1/agents/humi?canonical_slug=celo-9699&lang=eng" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Accept: application/json"
```

Direct Supabase (skip Worker) for smoke tests:

```bash
curl -sS "https://mezqyworblseixaypftg.supabase.co/functions/v1/api-demo-agent-humi?canonical_slug=celo-9699&lang=eng" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Accept: application/json"
```

---

## 3. Successful response (200)

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

### Field notes

- `agent.canonical_slug` = `web_dashboard.agents.on_chain_id` (same as Free Tier).
- `humi.summary` comes from `index_madurity_details` (`index=humi`, agent level), localized by `lang`.
- `humi.pillars.*.summary` is the `index_humi` JSONB (executive summary + blocks/items).
- `agent_warnings` without `score_impact`.

---

## 4. Errors

| Status | Case |
|--------|------|
| 401 | Missing Bearer or wrong secret |
| 400 | Missing `canonical_slug`, agent not found, or no HUMI row |
| 429 | Worker rate limit (20 req/min/IP) |
| 404 | Unknown path on the Worker |

---

## 5. Cloudflare deploy checklist

**Canonical infra repo:** **[public-api](https://github.com/GlobalScoreAgent/public-api)** (`gsa-api-router`). Do not edit the Worker in this monorepo.

1. Edge Function `api-demo-agent-humi` deployed + secret `GSA_HUMI_DEMO_SECRET` in Supabase.
2. In `public-api`: `humi` route in `src/index.js` + pattern in `wrangler.toml`.
3. Workers Builds connected to `public-api` (or `wrangler deploy`).
4. Public host E2E curl (see `docs/DEPLOY-HUMI-DEMO.md` in `public-api`).

---

## 6. Relation to Free Tier

| Endpoint | Auth | Detail |
|----------|------|--------|
| `/v1/agents/search` | None | Discovery → get `canonical_slug` |
| `/v1/agents/maturity` | None | Basic HUMI/WAMI labels |
| `/v1/agents/humi` | Demo Bearer | Full HUMI analysis (this doc) |

---

**Demo document.** Do not expose the secret on public frontends; use it only in the hackathon app (server-side).
