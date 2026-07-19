import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Separate build dir so `next dev` doesn't collide with the already-running `next start` on port 3000.
  distDir: process.env.NEXT_DEV_DISTDIR || ".next",
};

export default nextConfig;
