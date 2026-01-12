/**
 * Post-build script for Vite SSG
 *
 * Runs after Vite SSG build to:
 * 1. Rename llms.txt.md → llms.txt
 * 2. Generate Pagefind search index
 *
 * Note: Vite automatically copies public/ contents to dist/ root,
 * so no manual asset copying is needed.
 */
import { execSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

// Rename llms.txt.html → llms.txt (SSG adds .html suffix)
const llmsSrc = path.join(distDir, "llms.txt.html");
const llmsDest = path.join(distDir, "llms.txt");
if (existsSync(llmsSrc)) {
  renameSync(llmsSrc, llmsDest);
  console.log("📝 Renamed llms.txt.html → llms.txt");
}

// Generate Pagefind search index
console.log("\n🔍 Generating search index...");
try {
  execSync("npx pagefind --site dist", {
    cwd: rootDir,
    stdio: "inherit",
  });
} catch (error) {
  console.error("❌ Pagefind indexing failed");
  process.exit(1);
}

console.log("\n🎉 Post-build complete!");
