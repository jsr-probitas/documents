/**
 * LLM-friendly content generation for AI agents and tools
 *
 * Implements the llms.txt standard: https://llmstxt.org/
 */

import { docPages, siteMetadata } from "../data/docs.ts";

/**
 * Generate /llms.txt content - an index of documentation pages
 * This serves as a "sitemap for AI" with brief descriptions
 */
export function generateLlmsTxt(): string {
  const lines: string[] = [
    `# ${siteMetadata.name}`,
    "",
    `> ${siteMetadata.description}`,
    "",
    "## Documentation",
    "",
    ...docPages.map((doc) =>
      `- [${doc.title}](${doc.path}.md): ${doc.description}`
    ),
    "",
    "## Links",
    "",
    `- [GitHub](${siteMetadata.github})`,
    `- [JSR Package](${siteMetadata.jsr})`,
    "",
  ];
  return lines.join("\n");
}

/**
 * Generate /llms-full.txt content - complete documentation in one file
 * Optimized for LLM context windows
 */
export async function generateLlmsFullTxt(): Promise<string> {
  const sections: string[] = [
    `# ${siteMetadata.name} - Complete Documentation`,
    "",
    `> ${siteMetadata.description}`,
    "",
    "---",
    "",
  ];

  for (const doc of docPages) {
    const content = await Deno.readTextFile(doc.file);
    sections.push(
      `<!-- Source: ${doc.path}.md -->`,
      "",
      content.trim(),
      "",
      "---",
      "",
    );
  }

  sections.push(
    "## Additional Resources",
    "",
    `- GitHub: ${siteMetadata.github}`,
    `- JSR: ${siteMetadata.jsr}`,
    `- Website: ${siteMetadata.baseUrl}`,
    "",
  );

  return sections.join("\n");
}
