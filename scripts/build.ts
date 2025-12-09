/**
 * Static Site Generation build script
 * Uses Hono's official SSG helper
 */
import { defaultExtensionMap } from "hono/ssg";
import { toSSG } from "hono/deno";
import app from "../main.ts";

// Clean dist directory
try {
  await Deno.remove("./dist", { recursive: true });
} catch {
  // Directory may not exist
}

console.log("🏗️  Building static site...");

const result = await toSSG(app, {
  dir: "./dist",
  extensionMap: {
    "application/json": "json",
    "text/markdown": "md",
    ...defaultExtensionMap,
  },
});

if (!result.success) {
  console.error("❌ Build failed:", result.error);
  Deno.exit(1);
}

console.log(`✅ Generated ${result.files.length} files`);
for (const file of result.files) {
  console.log(`   ${file}`);
}

// Post-process: Rename llms.txt.md to llms.txt
try {
  await Deno.rename("./dist/llms.txt.md", "./dist/llms.txt");
  console.log("📝 Renamed llms.txt.md → llms.txt");
} catch {
  // File may not exist
}

// Copy static assets
console.log("\n📦 Copying static assets...");
await Deno.mkdir("./dist/static", { recursive: true });

for await (const entry of Deno.readDir("./static")) {
  if (entry.isFile && entry.name !== ".DS_Store") {
    await Deno.copyFile(
      `./static/${entry.name}`,
      `./dist/static/${entry.name}`,
    );
    console.log(`   static/${entry.name}`);
  }
}

console.log("\n🎉 Build complete!");
