import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite is WASM/filesystem-backed and breaks when bundled by
  // Turbopack/webpack (path resolution turns into a URL object where
  // Node's fs expects a string) — load it natively instead.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
