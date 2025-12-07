/**
 * Markdown rendering utilities
 */
import { marked, type Tokens } from "marked";

/** Generate slug from text (for heading IDs) */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1") // Remove inline code backticks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Configure marked with custom heading renderer for IDs
marked.use({
  gfm: true, // GitHub Flavored Markdown
  breaks: false,
  renderer: {
    heading(this: unknown, token: Tokens.Heading): string {
      const id = slugify(token.text);
      const text = this
        // deno-lint-ignore no-explicit-any
        ? (this as any).parser.parseInline(token.tokens)
        : token.text;
      return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
    },
  },
});

/** Parse markdown content to HTML */
export function parseMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

/**
 * Options for parsing API documentation markdown
 */
export interface ApiMarkdownOptions {
  /** Map of type names to package names for cross-package linking */
  typeToPackage?: Map<string, string>;
  /** Set of local type names in the current package */
  localTypes?: Set<string>;
  /** Current package name (e.g., "builder") */
  currentPackage?: string;
}

/**
 * Process JSDoc link tags ({@link name} and {@linkcode name}) to HTML links
 *
 * Supports formats:
 * - {@link TypeName} - creates a link with regular text
 * - {@linkcode TypeName} - creates a link with code formatting
 * - {@link TypeName description} - link with custom description text
 */
function processJsDocLinks(
  content: string,
  options: ApiMarkdownOptions,
): string {
  const { typeToPackage, localTypes, currentPackage } = options;

  // Match {@link name} or {@linkcode name} with optional description
  // Pattern: {@link(code)? name (optional description)}
  // Name must not contain } or whitespace
  const linkPattern = /\{@(link|linkcode)\s+([^\s}]+)(?:\s+([^}]+))?\}/g;

  return content.replace(linkPattern, (_, tag, name, description) => {
    const isCode = tag === "linkcode";
    const displayText = description?.trim() || name;

    // Determine the target URL
    let href: string | null = null;

    // Check if it's a local type in the current package
    if (localTypes?.has(name) && currentPackage) {
      href = `/api/${currentPackage}#${name.toLowerCase()}`;
    } // Check if it's in another package
    else if (typeToPackage?.has(name)) {
      const targetPackage = typeToPackage.get(name)!;
      href = `/api/${targetPackage}#${name.toLowerCase()}`;
    } // Default: link to current package anchor (best effort)
    else if (currentPackage) {
      href = `/api/${currentPackage}#${name.toLowerCase()}`;
    }

    // Format the display text
    const formattedText = isCode ? `<code>${displayText}</code>` : displayText;

    // Return link or just formatted text if no href could be determined
    if (href) {
      return `<a href="${href}" class="type-link">${formattedText}</a>`;
    }
    return formattedText;
  });
}

/**
 * Parse API documentation markdown with JSDoc link support
 *
 * This function processes JSDoc {@link} and {@linkcode} tags before
 * parsing as markdown, creating proper links to API documentation.
 */
export function parseApiMarkdown(
  content: string,
  options: ApiMarkdownOptions = {},
): string {
  const processed = processJsDocLinks(content, options);
  return parseMarkdown(processed);
}

/** Read and parse a markdown file */
export async function readMarkdownFile(path: string): Promise<string> {
  const content = await Deno.readTextFile(path);
  return parseMarkdown(content);
}

/** Extract title from markdown (first h1) */
export function extractTitle(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1];
}

/** Extract table of contents from markdown headings (h2 only) */
export function extractToc(
  content: string,
): Array<{ id: string; label: string; level: number }> {
  const headingRegex = /^(##)\s+(.+)$/gm;
  const toc: Array<{ id: string; label: string; level: number }> = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const rawLabel = match[2];

    // Clean label for display
    const label = rawLabel
      .replace(/`([^`]+)`/g, "$1") // Remove inline code backticks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Remove links

    // Use same slugify function as renderer
    const id = slugify(rawLabel);

    toc.push({ id, label, level });
  }

  return toc;
}
