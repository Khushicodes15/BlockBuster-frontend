import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in $HOME otherwise confuses inference.
  turbopack: { root: import.meta.dirname },
  // Proxy browser API calls through the Next server to dodge CORS.
  // Browser hits same-origin /api/backend/*; Next forwards to Cloud Run.
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination:
          "https://blockbuster-615636980270.europe-west1.run.app/:path*",
      },
    ];
  },
};

export default nextConfig;
