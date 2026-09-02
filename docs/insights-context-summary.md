# Resumen de contexto — GSA Insights

Handoff para continuar el **blog de análisis ERC-8004** en un chat nuevo.  
**Última actualización:** 2 septiembre 2026 — link Insights en sidebar marketing (`/insights`, ambiente-aware).

Complementa [`docs/marketing-web-context-summary.md`](marketing-web-context-summary.md) (web pública) y [`docs/AGENT-RULES.md`](AGENT-RULES.md).

---

## 0. Qué es

**GSA Insights** es la publicación propia de análisis del ecosistema **ERC-8004**, con datos indexados por Global Score Agent. No es documentación de producto (`/docs`) ni changelog (`13 - Novedades`).

| Superficie | URL |
|------------|-----|
| **Canónica (live)** | `https://insights.globalscoreagent.com` |
| Redirect 301 | `www` / apex `/insights` y `/insights/*` → subdominio (paths limpios: `/slug`) |
| Pieza 1 | `https://insights.globalscoreagent.com/erc-8004-eight-months-on-mainnet` |
| Nav marketing | Sidebar → `GSA Insights` → `/insights` (local/preview); en www/apex prod el middleware hace 301 al subdominio |

**Vault:** [[04 - Growth/Insights]] · ADR [[08 - Decisiones/2026-08-18 - Insights propio origen de análisis ERC-8004]]  
**Pipeline:** Data Insights (brief EN) → editorial ES/EN → repo MD → redes (`shared_on.blog`).

---

## 1. Modelo de notas en vault (una pieza = una ficha)

Evitar duplicar el cuerpo del artículo en Obsidian. El **repo git** es el cuerpo canónico.

| Nota vault | Rol | ¿Una por pieza? |
|------------|-----|-----------------|
| `04 - Growth/Data Insights/YYYY-MM-DD - …` | Brief de hechos (inglés, SELECT, método) | Sí — **origen analítico** |
| `04 - Growth/blog/YYYY-MM-DD - {slug}.md` | **Ficha de publicación** (metadatos, URLs, enlaces al repo) | Sí — **una sola** por slug |
| ~~`…slug.es.md`~~ | **No usar** — ES vive en repo + misma ficha | — |

La confusión habitual: el brief **landscape** y la ficha **blog** tratan el mismo tema pero cumplen roles distintos (hechos internos vs pieza publicada). No fusionar.

---

## 2. Stack en repo

| Área | Path |
|------|------|
| Rutas | `app/insights/`, `app/insights/[slug]/` |
| Shell | `components/insights/InsightsShell.tsx` (video fondo, header sticky, **no** MarketingShell) |
| Hub índice | `InsightsIndexClient`, featured, KPIs, listado, Próximas notas, tags |
| Artículo | `InsightsArticleClient`, TOC, markdown, barra progreso |
| Copy UI | `content/insights/copy.ts` |
| Manifiesto | `content/insights/manifest.ts` (slug, tags, SEO, cover) |
| Posts MD | `content/insights/posts/{en,es}/{slug}.md` |
| Pipeline editorial | `content/insights/upcoming.ts` |
| SEO | `lib/insights/metadata.ts`, `lib/insights/json-ld.ts`, `lib/insights/seo-keywords.ts` |
| Sitemap | `app/sitemap.ts` (Insights bajo `INSIGHTS_SITE_URL`) |
| LLMs | `public/llms.txt`, `public/llms-full.txt` (URLs Insights en el subdominio) |
| Host rewrite | `middleware.ts` + `lib/insights/site.ts` (rewrite subdominio + 301 desde www/apex) |
| Video fondo | `public/blog_background.mp4` |

---

## 3. SEO (agosto 2026)

- **Keywords** ERC-8004 en metadata índice y artículos (`lib/insights/seo-keywords.ts`).
- **JSON-LD:** `Blog` en índice; `BlogPosting` + `BreadcrumbList` en artículos.
- **Open Graph / Twitter** con cover `public/blog/nota_1.png` en la primera pieza.
- **hreflang** EN default + `?lang=es`.
- **robots** index/follow explícito.
- **Canonical por host:** `insightsCanonicalUrl()` usa el subdominio si `Host` es `insights.*`; en www sigue `/insights/...`.

Al publicar una pieza nueva: ampliar `seoKeywords` en manifest, verificar sitemap y añadir entrada en `llms-full.txt`.

---

## 4. UX navegación (agosto 2026)

Header sticky en artículos:

- **Todas las notas** → índice Insights (solo en páginas de artículo).
- **Global Score Agent** → sitio principal (`globalscoreagent.com`).
- **Idioma** ES/EN.

---

## 5. Reglas editoriales

- Enfoque **ecosistema ERC-8004**, no pitch de HUMI/WAMI/Walcert/API/dashboard en el cuerpo.
- Footer mínimo: datos indexados por GSA.
- Bilingüe ES/EN; briefs Data Insights siguen en inglés.
- No envolver en `MarketingShell`; no sidebar de producto.

---

## 6. Publicar una pieza nueva (checklist)

1. Brief en vault `04 - Growth/Data Insights/` + fila en su índice.
2. Cuerpos EN/ES en `content/insights/posts/`.
3. Entrada en `content/insights/manifest.ts`.
4. Ficha única en `04 - Growth/blog/` (sin `.es.md` separado); URLs canónicas en el subdominio.
5. Fila en `04 - Growth/blog/Índice.md`.
6. Marcar `shared_on.blog` en el brief de Data Insights.
7. Actualizar `public/llms-full.txt` si es pieza destacada.
8. Opcional: nota en `13 - Novedades del Producto/` si se comunica como product update.

---

## 7. Pitfalls

- **Strict Mode + IDs de headings:** IDs de TOC deben derivarse de `extractHeadings` por línea AST (`InsightsMarkdown`), no contador en render.
- **Hooks TOC:** no poner `useEffect` después de un `return null` (`InsightsTableOfContents`).
- **Idioma SSR:** `LanguageContext` arranca en `en`; `?lang=es` se aplica en cliente — metadata SEO acepta `?lang=es` en `generateMetadata`.
- **Dos hosts:** rewrite en `insights.*`. En **www/apex de producción**, `/insights` y `/insights/*` hacen **301** al subdominio (paths limpios). Localhost y previews Vercel **no** redirigen.
- **Estáticos en el subdominio:** el matcher de middleware **debe** excluir `.mp4` (y otros assets). Si no, `/blog_background.mp4` se reescribe a `/insights/[slug]` y da **404**. `shouldRewriteInsightsPath` también excluye extensiones estáticas.
- **No duplicar** artículo completo en vault blog; repo es canónico.

---

## 8. Wikilinks vault

- [[04 - Growth/Insights]]
- [[04 - Growth/blog/Índice]]
- [[04 - Growth/Data Insights/Índice]]
- [[01 - Aplicación/Marketing/Rutas y páginas]]
