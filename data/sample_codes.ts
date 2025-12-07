/**
 * Sample codes displayed in the hero section carousel
 */

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

const INDEX_DIR = new URL("./index/", import.meta.url);

async function discoverSampleFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(INDEX_DIR)) {
    if (entry.isFile && entry.name.endsWith(".probitas.ts")) {
      files.push(entry.name);
    }
  }
  return files.sort();
}

interface SampleCodeWithOrder extends SampleCode {
  order: number;
}

async function loadSampleCode(filename: string): Promise<SampleCodeWithOrder> {
  const code = await Deno.readTextFile(new URL(filename, INDEX_DIR));
  const metaText = await Deno.readTextFile(
    new URL(`${filename}.json`, INDEX_DIR),
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
