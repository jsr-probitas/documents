import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import honox from "honox/vite";
import ssg from "@hono/vite-ssg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages base path (set via environment variable or default to root)
const base = process.env.BASE_PATH ?? "/";

export default defineConfig(({ mode }) => {
  // Client build (JS only - CSS served from public/)
  if (mode === "client") {
    return {
      base,
      build: {
        rollupOptions: {
          input: ["/app/client.ts"],
          output: {
            entryFileNames: "static/[name].js",
          },
        },
        outDir: "dist",
        emptyOutDir: true,
        manifest: true,
      },
    };
  }

  // SSG build (default)
  return {
    base,
    build: {
      emptyOutDir: false, // Preserve client build assets
    },
    plugins: [
      honox({
        client: {
          input: ["/app/client.ts"],
        },
        devServer: {
          // Pass base path to fix import.meta.env.BASE_URL in dev
          base,
        },
      }),
      ssg({ entry: "./app/server.ts" }),
    ],
    resolve: {
      alias: {
        // Resolve @tabler/icons JSON exports
        "@tabler/icons/tabler-nodes-outline.json": path.resolve(
          __dirname,
          "node_modules/@tabler/icons/tabler-nodes-outline.json",
        ),
      },
    },
  };
});
