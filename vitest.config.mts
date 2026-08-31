import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // ponytail: each test file spins up its own PGlite (WASM Postgres);
    // running them in parallel causes CPU contention and flaky timeouts.
    // Revisit if the suite grows large enough that sequential runs are slow.
    fileParallelism: false,
    testTimeout: 15000,
  },
});
