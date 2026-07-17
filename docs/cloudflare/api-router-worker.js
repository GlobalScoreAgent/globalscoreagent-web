/**
 * Cloudflare Worker: proxy API pública → Supabase Edge Functions.
 * Rate limit: 20 requests / minute / IP por ruta (KV RATE_LIMIT_KV).
 *
 * Rutas:
 *   GET /v1/agents/search      → api-search-agent
 *   GET /v1/agents/maturity*   → api-agent-basic-data
 */

const SUPABASE_FUNCTIONS_BASE =
  "https://mezqyworblseixaypftg.supabase.co/functions/v1";

const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 60;

const ROUTES = [
  {
    id: "search",
    match: (pathname) =>
      pathname === "/v1/agents/search" || pathname === "/v1/agents/search/",
    functionName: "api-search-agent",
  },
  {
    id: "maturity",
    match: (pathname) =>
      pathname === "/v1/agents/maturity" ||
      pathname.startsWith("/v1/agents/maturity/"),
    functionName: "api-agent-basic-data",
  },
];

function resolveRoute(pathname) {
  return ROUTES.find((route) => route.match(pathname));
}

async function checkRateLimit(routeId, ip, env) {
  const bucket = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  const key = `${routeId}:${ip}:${bucket}`;

  const raw = await env.RATE_LIMIT_KV.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= RATE_LIMIT) {
    return { allowed: false };
  }

  await env.RATE_LIMIT_KV.put(key, String(count + 1), {
    expirationTtl: RATE_WINDOW_SECONDS * 2,
  });

  return { allowed: true };
}

function buildSupabaseHeaders(request) {
  const headers = new Headers();
  const auth = request.headers.get("Authorization");
  const apikey = request.headers.get("apikey");
  if (auth) headers.set("Authorization", auth);
  if (apikey) headers.set("apikey", apikey);
  headers.set("Content-Type", "application/json");
  return headers;
}

function rateLimitResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Too many requests. Maximum 20 requests per minute per IP.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(RATE_WINDOW_SECONDS),
      },
    },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = resolveRoute(url.pathname);

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { allowed } = await checkRateLimit(route.id, ip, env);

    if (!allowed) {
      return rateLimitResponse();
    }

    const target = new URL(`${SUPABASE_FUNCTIONS_BASE}/${route.functionName}`);
    target.search = url.search;

    return fetch(target.toString(), {
      method: request.method,
      headers: buildSupabaseHeaders(request),
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
    });
  },
};
