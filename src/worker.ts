/**
 * Optional Worker: /health + security headers + SPA asset fallback.
 * Does not read or write game progress. No PII, no telemetry.
 *
 * Routing: wrangler assets.run_worker_first is only ["/health","/health/*"].
 * Navigation and hashed files are served as assets (see public/_headers).
 * Non-navigation misses that still reach this script fall through to ASSETS.
 *
 * Docs: https://developers.cloudflare.com/workers/static-assets/binding/
 */

export interface Env {
  ASSETS: Fetcher;
}

const SECURITY: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // COOP/COEP omitted: unverified against Three.js / blob workers.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

function withSecurity(response: Response, extra?: Record<string, string>): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY)) {
    headers.set(key, value);
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      headers.set(key, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isHealthPath(pathname: string): boolean {
  return pathname === "/health" || pathname.startsWith("/health/");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (isHealthPath(url.pathname)) {
      return withSecurity(
        new Response(
          JSON.stringify({
            ok: true,
            service: "life-circuit-chengwan",
            gameState: false,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store",
            },
          },
        ),
      );
    }

    const asset = await env.ASSETS.fetch(request);
    return withSecurity(asset);
  },
} satisfies ExportedHandler<Env>;
