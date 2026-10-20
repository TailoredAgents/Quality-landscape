import type { NextConfig } from "next";
import { business } from "./src/lib/business";
const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["pg", "@electric-sql/pglite", "bcryptjs"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(process.env.PREVIEW_MODE !== "false" ||
          !business.approvedForLaunch
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
            : []),
        ],
      },
    ];
  },
};
export default nextConfig;
