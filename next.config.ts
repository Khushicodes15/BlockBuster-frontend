import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in $HOME otherwise confuses inference.
  turbopack: { root: import.meta.dirname },
  // CORS proxy now lives in src/app/api/backend/[...path]/route.ts so it can
  // strip the browser's (potentially huge) Cookie header before forwarding —
  // a plain rewrite() forwards cookies verbatim and Cloud Run 500s on them.
};

export default nextConfig;
