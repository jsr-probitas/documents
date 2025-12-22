import { assert } from "jsr:@std/assert@^1.0.16";
import { walkSync } from "jsr:@std/fs@^1.0.0/walk";
import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.47/deno-dom-wasm.ts";
import { dirname, fromFileUrl, resolve } from "jsr:@std/path@^1.0.1";
import { basePath, siteMetadata } from "../data/docs.ts";

const SRC_ROOT = fromFileUrl(import.meta.resolve("../"));
const SITE_ROOT = resolve(SRC_ROOT, "dist");
const FILES = new Map<string, File | Error>();

const SKIP_PATTERNS = [
  /pagefind/,
  /api/,
];

type Link = [path: string, fragment: string | null];
type File = {
  type: "markdown";
  path: string;
  links: Set<Link>;
  ids: null;
} | {
  type: "html";
  path: string;
  links: Set<Link>;
  ids: Set<string>;
};

function findFilesToCrawl(): string[] {
  const filesToCrawl = new Set<string>();
  for (
    const entry of walkSync(SITE_ROOT, {
      //exts: [".html", ".md", ".txt"],
      exts: [".md", ".txt"],
      includeFiles: true,
      skip: SKIP_PATTERNS,
    })
  ) {
    filesToCrawl.add(entry.path);
  }
  return [...filesToCrawl].toSorted();
}

function isTargetLink(link: string): boolean {
  const excludes = ["mailto:", "tel:", "data:", "http:", "https:"];
  if (excludes.some((prefix) => link.startsWith(prefix))) {
    return false;
  }
  return link.endsWith(".html") || link.endsWith(".md") ||
    link.endsWith(".txt") || link.endsWith("/");
}

function normalizeLink(link: string, htmlMode: boolean): Link {
  const [path, fragment = null] = link.split("#");
  const cleanPath = path.split("?")[0];
  const basePaths = new Set<string>();
  if (basePath) {
    basePaths.add(basePath);
  }
  try {
    const { pathname } = new URL(siteMetadata.baseUrl);
    if (pathname && pathname !== "/") {
      basePaths.add(pathname);
    }
  } catch {
    // Ignore invalid baseUrl; basePaths will rely on BASE_PATH.
  }
  let normalizedPath = cleanPath;
  for (const candidate of basePaths) {
    const normalizedCandidate = candidate.endsWith("/")
      ? candidate.slice(0, -1)
      : candidate;
    if (
      normalizedCandidate &&
      normalizedPath.startsWith(normalizedCandidate)
    ) {
      const nextPath = normalizedPath.slice(normalizedCandidate.length);
      normalizedPath = nextPath || "/";
      break;
    }
  }
  if (!cleanPath) {
    return ["", fragment];
  }
  if (htmlMode && normalizedPath.endsWith("/")) {
    return [`${normalizedPath}index.html`, fragment];
  }
  return [normalizedPath, fragment];
}

function readFile(filePath: string): File {
  if (filePath.endsWith(".md") || filePath.endsWith(".txt")) {
    return readMarkdownFile(filePath);
  } else if (filePath.endsWith(".html")) {
    return readHtmlFile(filePath);
  } else {
    throw new Error(`Unsupported file type: ${filePath}`);
  }
}

function readMarkdownFile(path: string): File {
  const content = Deno.readTextFileSync(path);
  const markdownLinkRegex = /\[[^\]]+\]\(([^\)]+)\)/g;
  // Find all internal links
  const links = new Set<Link>();
  content.matchAll(markdownLinkRegex).forEach((match) => {
    const link = match[1].trim();
    if (link && isTargetLink(link)) links.add(normalizeLink(link, false));
  });
  return { type: "markdown", path, links, ids: null } as const;
}

function readHtmlFile(path: string): File {
  const content = Deno.readTextFileSync(path);
  const doc = new DOMParser().parseFromString(content, "text/html");
  if (!doc) {
    throw new Error(`Failed to parse HTML file: ${path}`);
  }
  // Find all internal links
  const links = new Set<Link>();
  doc.querySelectorAll("[href]").forEach((el) => {
    const link = (el as Element).getAttribute("href")?.trim();
    if (link && isTargetLink(link)) links.add(normalizeLink(link, true));
  });
  doc.querySelectorAll("[src]").forEach((el) => {
    const link = (el as Element).getAttribute("src")?.trim();
    if (link && isTargetLink(link)) links.add(normalizeLink(link, true));
  });
  // Find all IDs
  const ids = new Set<string>();
  doc.querySelectorAll("[id]").forEach((el) => {
    const id = (el as Element).getAttribute("id")?.trim();
    if (id) ids.add(id);
  });
  return { type: "html", path, links, ids } as const;
}

function checkLink(
  [path, fragment]: Link,
  base: string,
): { exists: boolean; resolvedPath: string } {
  const resolvePath = (path: string): string => {
    if (path.startsWith("/")) {
      return resolve(SITE_ROOT, path.substring(1));
    }
    return resolve(base, path);
  };
  const resolvedPath = resolvePath(path);
  let targetFile = FILES.get(resolvedPath);
  if (!targetFile) {
    try {
      targetFile = readFile(resolvedPath);
      FILES.set(resolvedPath, targetFile);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      FILES.set(resolvedPath, error);
      return { exists: false, resolvedPath };
    }
  }
  if (targetFile instanceof Error) {
    return { exists: false, resolvedPath };
  }
  if (fragment && targetFile.type === "html") {
    return { exists: targetFile.ids.has(fragment), resolvedPath };
  }
  return { exists: true, resolvedPath };
}

Deno.test("Site Link Checker", async (t) => {
  // Gather all HTML and MD files in the SITE_ROOT
  const filesToCrawl = findFilesToCrawl();
  assert(
    filesToCrawl.length > 0,
    "No files found to check in `dist` directory.",
  );

  // Read all files and extract links
  const filesToCheck: File[] = [...filesToCrawl].map(readFile);

  const normalizePath = (path: string) => path.replace(SITE_ROOT, "");
  const formatLink = ([path, fragment]: Link) =>
    fragment ? `${path}#${fragment}` : path;

  for (const file of filesToCheck) {
    for (const link of file.links) {
      const linkStr = formatLink(link);
      const filePath = normalizePath(file.path);
      await t.step(
        `Check ${linkStr} from ${filePath}`,
        () => {
          const { exists, resolvedPath } = checkLink(link, dirname(file.path));
          const resolvedLinkStr = normalizePath(resolvedPath);
          assert(
            exists,
            `Internal file link broken: ${linkStr} (from ${filePath} to ${resolvedLinkStr})`,
          );
        },
      );
    }
  }
});
