// Server-side proxy to the BlockBuster backend.
//
// Replaces a next.config `rewrites()` proxy because that blindly forwards the
// browser's Cookie header. On localhost (shared with other apps) those cookies
// balloon the upstream request headers and Cloud Run rejects them with a 500.
// Here we forward only a minimal, safe header set and stream the response back
// (so SSE /playbook-stream works too).

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "https://blockbuster-615636980270.europe-west1.run.app";

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const target = `${BACKEND_ORIGIN}/${path.map(encodeURIComponent).join("/")}${new URL(req.url).search}`;

  // Only forward headers the backend actually needs — never cookies/host.
  const headers = new Headers();
  const ct = req.headers.get("content-type");
  const accept = req.headers.get("accept");
  if (ct) headers.set("content-type", ct);
  if (accept) headers.set("accept", accept);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  // Read the body to a string so we send a plain (non-streamed) request — no
  // `duplex` needed, which undici rejects alongside a non-stream body.
  const body = hasBody ? await req.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      cache: "no-store",
    });
  } catch (err) {
    console.error(`[backend-proxy] ${req.method} ${target} failed:`, err);
    return Response.json(
      { error: "upstream_unreachable", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }

  // Pass the body through (streams SSE), copying only safe response headers.
  const resHeaders = new Headers();
  const passthrough = ["content-type", "cache-control"];
  for (const h of passthrough) {
    const v = upstream.headers.get(h);
    if (v) resHeaders.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
