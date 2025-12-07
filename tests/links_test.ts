import { assertEquals } from "@std/assert";
import { HomePage } from "../templates/home.tsx";

function extractLinks(html: string): string[] {
  const linkRegex = /href="(https?:\/\/[^"]+)"/g;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  // Remove duplicates and filter out preconnect hosts (not actual resources)
  const preconnectHosts = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ];
  return [...new Set(links)].filter((url) => !preconnectHosts.includes(url));
}

Deno.test("external links are accessible", async (t) => {
  const jsx = await HomePage();
  const html = jsx.toString();
  const links = extractLinks(html);

  if (links.length === 0) {
    throw new Error("No external links found in rendered HTML");
  }

  for (const url of links) {
    await t.step(url, async () => {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
      });
      assertEquals(
        res.ok,
        true,
        `Expected ${url} to return OK, got ${res.status}`,
      );
    });
  }
});
