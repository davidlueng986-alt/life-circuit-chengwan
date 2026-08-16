import { defineConfig } from "vite";

// Client SPA only. Worker is bundled by Wrangler from src/worker.ts.
// Docs: https://developers.cloudflare.com/workers/static-assets/
export default defineConfig({
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    assetsDir: "assets",
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
