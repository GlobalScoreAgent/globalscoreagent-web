# Resumen de Contexto del Proyecto — Web pública (Marketing)

Documento de handoff para continuar el desarrollo de la **web oficial** en un chat nuevo de Cursor.  
**Última actualización:** agosto 2026 — página `/about` (Nosotros) + Public API Free Tier + Walcert marketing/dashboard en `main`.

Complementa [`docs/dashboard-context-summary.md`](dashboard-context-summary.md) (panel autenticado) y [`docs/AGENT-RULES.md`](AGENT-RULES.md) (reglas globales).

---

## 0. Estado de producción (v1)

| Aspecto | Detalle |
|---------|---------|
| **Rama de producción** | `main` (integración marketing + dashboard, merge `aff1172`) |
| **URL canónica** | `https://www.globalscoreagent.com` (Vercel; apex → `www`) |
| **Site URL SEO** | `https://globalscoreagent.com` (`lib/seo/site.ts`, metadataBase) |
| **Deploy** | Vercel — auto-deploy desde `main` |
| **Versión** | **v1** — landing, HUMI/WAMI, **Walcert**, **Public API Free Tier**, **About/Nosotros**, pricing, docs, agentes públicos, Top 10 |

### Cambios recientes (agosto 2026)

- **About / Nosotros (`/about`):** página bilingüe con producto, founder card (Ibzan Jair Valenzuela Suarez + LinkedIn/X), reconocimiento unificado hackathon ETH UY + pitch BSG 2026 (GlassCard elevated, lightbox de imágenes, links GitHub / Blockchain Summit / DoraHacks). Nav + footer. Se eliminó el redirect legacy `/about` → `/#mission` en `next.config.js`. Copy: `content/about/`. Assets: `public/hackaton_eth_2026.jpg`, `hackaton_eth_2026_2.jpg`, `hackaton_2026_premiacion.jpg`, `blockchain_summit_2026.png`.

### Cambios recientes (julio 2026)

- **Public API Free Tier:** landing `/public-api` (resumen + playgrounds search/maturity); docs `/docs/public-api-free-tier`; API `https://api.globalscoreagent.com` (`/v1/agents/search`, `/v1/agents/maturity`); proxy same-origin `GET /api/web-page/public-api-proxy`; home Tools CTA “Explorar API” + card **API Keys** Próximamente; nav sidebar Public API. Copy: `content/public-api/`.
- **Walcert:** páginas marketing `/walcert` (negocio + verificabilidad / verify por tx_hash) y `/walcert/developers` (HTTP/x402 + `POST /v1/verify`); nav sidebar + card en home; dashboard humano `/dashboard/walcert` (preview + verify + ejemplos). `GET https://walcert.globalscoreagent.com/` = **agent card JSON** (discovery; no UI). Identidad canónica web: agentId **9699** (Celo). Copy en `content/walcert/`.
- **No reabrir** `/certificaciones` (sigue redirect → `/`); URL canónica del producto es `/walcert`.

### Cambios recientes en producción (junio 2026)

- **Pricing:** página `/pricing` alineada con `docs/español/gsa-pricing.md` y `docs/ingles/gsa-pricing.md` (120 créditos Pro, matriz API 2/5/10 créditos); eliminado `docs/gsa-pricing.md` redundante en raíz.
- **Waitlist:** eliminada (`/waitlist`, API y copy).
- **KPI anti-cache:** headers CDN, `fetchWebPageStatistics` con cache-buster, refresh en `pageshow`/visibility/5 min (`lib/api/use-statistics-kpi-refresh.ts`).
- **Footer:** QR Zoho para agendar reunión + copy bilingüe (`public/booking-qr.png`, enlace Calendly/Zoho slot booking).
- **Auth:** login en `/auth/login`; OAuth comparte flujo con dashboard (`/auth/callback`).
- **Agentes públicos:** perfiles SEO en `/agents/[id]` (+ `/humi`, `/wami`).
- **Branding:** favicon en `app/favicon.ico`; logo marketing en `public/logo-gsa.png` (sidebar/footer).

---

## 1. Visión General

- **Producto:** Sitio marketing + documentación + conversión (registro, pricing, contacto) de **Global Score Agent** (reputación ERC-8004, índices HUMI/WAMI).
- **Separación del dashboard:** UI pública en `app/` (excl. `(dashboard)` y `auth` parcial); datos de lectura vía `app/api/web-page/**`.
- **Estado:** **~90%** del alcance v1 marketing en producción; Free Tier de API pública live; API de pago / API Keys aún próximamente.

---

## 2. Stack y convenciones

- **Next.js 14** App Router — ver `node_modules/next/dist/docs/` ante dudas de API
- **Tailwind** — paleta `zinc-950` + acento `gold`
- **i18n:** `LanguageContext` (ES/EN); copy en `content/marketing/`, `content/pricing/`, `content/humi/`, `content/wami/`, `content/walcert/`, `content/public-api/`, `content/about/`
- **Patrón copy:** objetos `{ es: '...', en: '...' }` + helper `pick(lang, obj)`
- **Supabase:** schema `web_page` en APIs; `NEXT_PUBLIC_SUPABASE_*` + service role en server routes
- **SEO:** `lib/seo/site.ts`, `metadata.ts`, JSON-LD, sitemap, `public/llms.txt`

---

## 3. Rutas públicas (v1)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing — hero, KPIs live, productos, misión, suscripciones teaser |
| `/humi` | Página índice HUMI marketing + KPI overlay |
| `/wami` | Página índice WAMI marketing + KPI overlay |
| `/walcert` | Walcert Agent — negocio / producto (certificados A–F + verify público) |
| `/walcert/developers` | Walcert — referencia técnica HTTP / x402 / `/v1/verify` |
| `/public-api` | Public API Free Tier — resumen + playgrounds search/maturity |
| `/pricing` | Planes dashboard, API de pago (preview muted), más detalles, CTA registro |
| `/about` | Nosotros / About — producto, fundador (Ibzan Jair Valenzuela Suarez), reconocimientos 2026 |
| `/top-10-agents` | Ranking público Top 10 |
| `/agents/[id]` | Perfil público agente (SEO) |
| `/agents/[id]/humi`, `/wami` | Subpáginas índice públicas |
| `/docs`, `/docs/[...slug]` | Documentación MD bilingüe desde `docs/español/` y `docs/ingles/` |
| `/legal` | Legal / privacidad |
| `/auth/login` | Login/registro (sin footer marketing shell en dashboard paths) |

**Eliminadas en v1:** `/waitlist`, `/certificaciones` (redirect → `/`).

---

## 4. Estructura de carpetas clave

```
app/
├── page.tsx, humi/, wami/, walcert/, walcert/developers/, public-api/, pricing/, about/, legal/, top-10-agents/
├── agents/[id]/              # Perfiles públicos
├── docs/                     # Render MD (loadDoc.ts)
├── auth/login/               # Login compartido con dashboard
└── api/web-page/
    ├── statistics/           # KPIs home/humi/wami
    ├── top-agents/
    ├── agents/[id]/, humi/, wami/
    ├── public-api-proxy/     # Proxy playgrounds → api.globalscoreagent.com
    └── roadmap/

components/marketing/         # Secciones, layout, KPI overlays, footer
components/public-api/        # Landing Free Tier + playgrounds
components/walcert/           # Secciones negocio + developers
components/pricing/           # Grids pricing, ReportTypePricingMatrix, etc.
content/marketing/copy.ts     # Copy landing + footer + nav
content/about/copy.ts         # Copy /about (Nosotros)
content/public-api/copy.ts    # Copy /public-api
content/walcert/              # Copy /walcert + /walcert/developers
content/pricing/copy.ts       # Copy /pricing
components/about/             # AboutPageClient
content/docs/manifest.ts      # Slugs (/docs/public-api-free-tier, /docs/gsa-pricing, …)
lib/public-api/               # constants + fetchPublicApi (client → proxy)
lib/api/
├── client-fetch.ts           # fetchWebPageStatistics (anti-cache)
├── route-config.ts           # Headers CDN no-store
└── use-statistics-kpi-refresh.ts
lib/docs/loadDoc.ts           # Carga docs/español|ingles/*.md
lib/seo/                      # site URL, JSON-LD, agent metadata pública
```

**Shell:** `HeaderWrapper` → `MarketingShell` (sidebar + footer) en todas las rutas excepto `/dashboard/**` y `/auth/**`.

---

## 5. Funcionalidades implementadas

### Landing y KPIs

- Overlays KPI en home, HUMI, WAMI — datos de `GET /api/web-page/statistics?page=main|humi|wami`
- Fuente BD: MV `web_page.global_score_agent_summary` (última fila)
- Anti-cache en cliente + headers CDN (`CDN-Cache-Control`, cache-buster query param)

### Public API Free Tier (`/public-api`)

- Resumen bilingüe de `GET /v1/agents/search` y `GET /v1/agents/maturity` + playgrounds
- Guías “Entender la respuesta” (campos search/maturity) con enlaces a `/docs/index-humi`, `/docs/index-wami`, `/docs/erc-8004`
- Proxy: `GET /api/web-page/public-api-proxy?endpoint=search|maturity` (evita CORS)
- Docs técnicas: `/docs/public-api-free-tier` (`docs/español|ingles/public-api-free-tier.md`, categoría `api` en manifest)
- Home Tools: CTA → `/public-api`; card API Keys **Próximamente**

### Pricing (`/pricing`)

- Planes dashboard desde `lib/gsa/dashboard-plan-catalog.ts` (Free / Solo / Pro)
- Sección API **de pago** con aviso **Próximamente** (opacidad reducida): paquetes créditos + matriz precio por tipo de reporte
- **Más detalles:** `lib/gsa/subscription-pricing-details.ts` (compartido con dashboard suscripciones)
- CTA registro → `/auth/login?redirect=/dashboard`
- Docs oficiales pricing: `/docs/gsa-pricing` (ES/EN)

### Documentación (`/docs`)

- Manifest: `content/docs/manifest.ts` (incl. `public-api-free-tier`)
- Archivos: `docs/español/*.md`, `docs/ingles/*.md` (incl. `dashboard/*`, `gsa-pricing.md`, `public-api-free-tier.md`)
- **No usar** `docs/gsa-pricing.md` en raíz (eliminado; era redundante)

### Footer y contacto

- Redes + email `hello@globalscoreagent.com`
- **Booking:** QR + texto bilingüe → Zoho Calendar (`meetingBooking.href` en `content/marketing/copy.ts`)
- Enlaces: docs, pricing, llms.txt

### Agentes y Top 10 públicos

- APIs: `/api/web-page/top-agents`, `/api/web-page/agents/[id]`, humi, wami
- SEO: `resolvePublicAgentMetadata`, sitemap, Open Graph por ruta

---

## 6. APIs marketing (`web_page`)

| Ruta API | Uso |
|----------|-----|
| `GET /api/web-page/statistics` | KPIs globales (main, humi, wami pages) |
| `GET /api/web-page/top-agents` | Top 10 público |
| `GET /api/web-page/agents/[id]` | Detalle agente público |
| `GET /api/web-page/agents/[id]/humi`, `/wami` | Índices públicos |
| `GET /api/web-page/public-api-proxy` | Proxy playgrounds → `api.globalscoreagent.com` |
| `GET /api/web-page/roadmap` | Roadmap (si se usa en UI) |

**API externa Free Tier:** `https://api.globalscoreagent.com/v1/agents/search`, `/v1/agents/maturity` (20 req/min/IP).

**Eliminadas:** `/api/waitlist`, APIs legacy `erc8004`, `humi/market-index`.

---

## 7. Integración BD (marketing)

| Objeto | Uso |
|--------|-----|
| `web_page.global_score_agent_summary` | KPIs marketing (MV) |
| Agentes públicos | Vistas/MVs expuestas vía grants (ver docs Supabase en repo si existen) |

Validar en Supabase: schema `web_page` expuesto en API settings.

---

## 8. Auth y conversión

- Registro/login: `/auth/login` → Supabase → `/auth/callback` → redirect cookie `gsa_oauth_redirect` o `/dashboard`
- Supabase Redirect URLs: `https://globalscoreagent.com/auth/callback`, `https://www.globalscoreagent.com/auth/callback`, `http://localhost:3000/auth/callback`
- Site URL Supabase: `https://globalscoreagent.com` (o `www` según config)

Ver [`docs/supabase-auth-setup.md`](supabase-auth-setup.md).

---

## 9. Reglas para agentes

- **Zona:** no editar `app/(dashboard)/**` ni `components/dashboard/**` salvo petición explícita
- **Shared:** `utils/supabase/*`, `app/layout.tsx`, `middleware.ts`, `next.config.js`, `lib/auth/*` — coordinar con dashboard
- **Copy:** siempre bilingüe ES/EN en `content/`
- **Reglas Cursor:** [`.cursor/rules/marketing-web-v2.mdc`](../.cursor/rules/marketing-web-v2.mdc) (actualizar globs: quitar `waitlist` cuando se edite la regla)

---

## 10. Próximos pasos sugeridos

1. Activar sección API **de pago** en `/pricing` y **API Keys** cuando estén listas (quitar Coming soon; Free Tier ya live)
2. Actualizar `.cursor/rules/marketing-web-v2.mdc` y `docs/BRANCHING.md` (waitlist obsoleto, `main` como prod)
3. Actualizar `docs/AGENT-RULES.md` §2 si se consolida solo rama `main`
4. Página `/book` embed Zoho (opcional; hoy QR en footer)
5. Tests E2E marketing (KPI refresh, pricing, docs, `/public-api` playgrounds)

---

## 11. Prompt sugerido — web marketing

```text
Usa la skill gsa-aplicacion. Lee docs/AGENT-RULES.md y docs/marketing-web-context-summary.md.
Producción en main (www.globalscoreagent.com). No toques dashboard salvo shared.
Copy bilingüe en content/; KPIs vía /api/web-page/statistics.
Docs pricing: docs/español/gsa-pricing.md (no docs/gsa-pricing.md raíz).
No commits/push salvo petición explícita.
```

---

## 12. Referencias cruzadas

| Documento | Uso |
|-----------|-----|
| [`docs/AGENT-RULES.md`](AGENT-RULES.md) | Reglas globales, BD, git |
| [`docs/dashboard-context-summary.md`](dashboard-context-summary.md) | Panel `/dashboard` |
| [`docs/BRANCHING.md`](BRANCHING.md) | Historial ramas (parcialmente desactualizado vs `main`) |
| [`AGENTS.md`](../AGENTS.md) | Índice rápido repo |
| [`content/docs/manifest.ts`](../content/docs/manifest.ts) | Slugs `/docs/*` |

---

*Última revisión: julio 2026 — Public API Free Tier + Walcert (marketing + dashboard) en `main`. Actualizar tras cambios de pricing, KPIs, rutas públicas o deploy.*
