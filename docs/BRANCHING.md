# Estrategia de ramas — Web oficial vs Dashboard

Este repositorio aloja **dos productos** en un solo monorepo Next.js. Trabajamos en ramas separadas para avanzar en paralelo sin pisarnos.

## Ramas

| Rama | Propósito | Quién |
|------|-----------|--------|
| `web-page-v2` | Landing y páginas públicas (marketing, SEO, APIs públicas) | Agente / equipo web oficial |
| `dashboard-final` | Panel `/dashboard/*`, APIs dashboard, componentes dashboard | Agente / equipo dashboard |
| `main` | Integración estable; merge de ambas ramas cuando estén listas | Revisión humana |

**Regla:** no mezclar commits grandes de marketing y dashboard en la misma rama salvo merges planificados hacia `main`.

## Zonas del código

### Solo marketing (`web-page-v2`)

- `app/page.tsx`, `app/about/`, `app/humi/`, `app/certificaciones/`, `app/legal/`, `app/waitlist/`
- `app/api/erc8004/`, `app/api/humi/`, `app/api/waitlist/`, `app/api/test-db/`
- `components/Header.tsx`, `app/components/HeaderWrapper.tsx`, `app/contexts/LanguageContext.tsx`
- Futuro: `app/(marketing)/`, `components/marketing/`

### Solo dashboard (`dashboard-final`)

- `app/(dashboard)/dashboard/**`
- `components/dashboard/**`, `components/ui/**`
- `app/api/dashboard/**`
- `lib/**` (utilidades del dashboard)

### Compartido (coordinación obligatoria)

Cambios aquí afectan a **ambas** ramas. Antes de editar:

1. Avisar en el PR o issue qué rama toca el archivo.
2. Preferir cambios **aditivos** (nuevos exports, nuevas vars de entorno) en lugar de refactors grandes.
3. Tras merge a `main`, la otra rama debe hacer **rebase o merge de `main`** pronto.

| Archivo / carpeta | Notas |
|-------------------|--------|
| `package.json`, `package-lock.json` | Nuevas deps: acordar; `npm install` en ambas ramas |
| `utils/supabase/*` | Clientes Supabase SSR/browser |
| `app/layout.tsx`, `app/globals.css` | Layout raíz; marketing usa `HeaderWrapper` |
| `next.config.js`, `tailwind.config.js`, `tsconfig.json` | Config global |
| `.env.example` | Documentar todas las variables; nunca commitear `.env` |

## Flujo recomendado para archivos compartidos

```
web-page-v2 ──PR──► main ◄──PR── dashboard-final
         │                    │
         └──── merge main ────┘  (cada 2–3 días o al tocar shared)
```

1. Cambio compartido pequeño → PR a `main` → ambas ramas actualizan desde `main`.
2. Cambio solo de marketing → PR `web-page-v2` → merge a `main` cuando esté listo.
3. Evitar editar el mismo archivo compartido en las dos ramas el mismo día sin sincronizar.

## APIs

- **Públicas (marketing):** prefijo lógico `app/api/erc8004`, `humi`, `waitlist` — schema `web_page` / lectura pública.
- **Dashboard:** `app/api/dashboard/**` — puede usar `utils/supabase/server` y schemas `erc_8004`, `index_humi`, etc.

No mover rutas de API entre zonas sin actualizar esta doc y las reglas de Cursor.
