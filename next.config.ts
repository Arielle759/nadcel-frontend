import type { NextConfig } from "next";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL)
  : undefined;

// Next.js 16 refuses to optimize images whose upstream URL resolves to a
// private/loopback IP (SSRF hardening). Our local dev backend lives on
// localhost, so that guard must be relaxed there — but only there, since
// dangerouslyAllowLocalIP defeats the protection entirely.
const isLocalApiOrigin = apiOrigin
  ? ["localhost", "127.0.0.1", "::1"].includes(apiOrigin.hostname)
  : false;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiOrigin
      ? [
          {
            protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
            hostname: apiOrigin.hostname,
            port: apiOrigin.port,
          },
        ]
      : [],
    ...(isLocalApiOrigin ? { dangerouslyAllowLocalIP: true } : {}),
  },
};

export default nextConfig;
