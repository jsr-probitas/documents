/**
 * Sample codes displayed in the hero section carousel
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface SampleCode {
  /** Filename displayed in the code header */
  title: string;
  /** Tab label */
  label: string;
  /** TypeScript code content */
  code: string;
}

interface SampleMeta {
  label: string;
  order: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INDEX_DIR = path.resolve(__dirname, "./index/");

async function discoverSampleFiles(): Promise<string[]> {
  const entries = await readdir(INDEX_DIR, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".probitas.ts")) {
      files.push(entry.name);
    }
  }
  return files.sort();
}

interface SampleCodeWithOrder extends SampleCode {
  order: number;
}

async function loadSampleCode(filename: string): Promise<SampleCodeWithOrder> {
  const code = await readFile(path.join(INDEX_DIR, filename), "utf-8");
  const metaText = await readFile(
    path.join(INDEX_DIR, `${filename}.json`),
    "utf-8",
  );
  const meta: SampleMeta = JSON.parse(metaText);

  return {
    title: filename,
    label: meta.label,
    code,
    order: meta.order,
  };
}

export async function loadSampleCodes(): Promise<SampleCode[]> {
  const sampleFiles = await discoverSampleFiles();
  const samples = await Promise.all(sampleFiles.map(loadSampleCode));
  return samples.sort((a, b) => a.order - b.order);
}
