/**
 * Global layout renderer for all pages
 *
 * This component wraps all routes and provides the HTML document structure,
 * including meta tags, stylesheets, and common UI elements like header.
 */
import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script } from "honox/server";
import { basePath } from "../lib/path.js";
import { Header } from "../components/Header.js";
import { SearchModal } from "../components/SearchModal.js";
import { ScrollToTop } from "../components/ScrollToTop.js";
import { siteMetadata } from "../../data/docs.js";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: RenderProps,
    ): Response | Promise<Response>;
  }
}

export interface RenderProps {
  /** Page title (will be suffixed with site name) */
  title: string;
  /** Page description for SEO */
  description?: string;
  /** Current page path for active nav state */
  current?: string;
  /** URL path to alternate markdown source */
  alternateMarkdown?: string;
  /** URL path to alternate JSON data */
  alternateJson?: string;
  /** Current page path for JSON-LD */
  pagePath?: string;
}

const CDN = {
  fonts:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
  // Pin to v3.25.0 - v3.26+ has rendering issues where icons appear filled/black
  tablerIcons:
    "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.25.0/dist/tabler-icons.min.css",
  hljs: "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build",
};

/**
 * Theme initialization script (runs before body to prevent FOUC)
 */
const themeInitScript = `(function() {
  const stored = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();`;

/**
 * Generate JSON-LD structured data for SEO
 */
function generateJsonLd(
  title: string,
  description: string,
  pagePath?: string,
): object {
  const baseUrl = siteMetadata.baseUrl;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    name: title,
    headline: title,
    description: description,
    url: pagePath ? `${baseUrl}${pagePath}` : baseUrl,
    isPartOf: {
      "@type": "WebSite",
      name: siteMetadata.name,
      url: baseUrl,
      description: siteMetadata.description,
    },
    publisher: {
      "@type": "Organization",
      name: siteMetadata.name,
      url: baseUrl,
    },
  };
}

export default jsxRenderer(
  (
    {
      children,
      title,
      description,
      current,
      alternateMarkdown,
      alternateJson,
      pagePath,
    },
  ) => {
    const pageDescription = description ?? siteMetadata.description;
    const fullTitle = `${title} - ${siteMetadata.name}`;
    const jsonLd = generateJsonLd(title, pageDescription, pagePath);

    return (
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta name="description" content={pageDescription} />
          <title>{fullTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin="anonymous"
          />
          <link href={CDN.fonts} rel="stylesheet" />
          <link rel="stylesheet" href={CDN.tablerIcons} />
          <Link href="/common.css" rel="stylesheet" />
          <Link href="/content.css" rel="stylesheet" />
          <link rel="icon" href={basePath("/favicon.ico")} />
          <link
            id="hljs-theme"
            rel="stylesheet"
            href={`${CDN.hljs}/styles/github-dark.min.css`}
          />
          {alternateMarkdown && (
            <link
              rel="alternate"
              type="text/markdown"
              href={alternateMarkdown}
              title="Markdown source"
            />
          )}
          {alternateJson && (
            <link
              rel="alternate"
              type="application/json"
              href={alternateJson}
              title="JSON data"
            />
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body>
          <Header current={current} />
          {children}
          <SearchModal />
          <ScrollToTop />
          <script src={basePath("/pagefind/pagefind-ui.js")} />
          {import.meta.env.PROD
            ? <script type="module" src={basePath("/static/client.js")} />
            : <Script src="/app/client.ts" />}
        </body>
      </html>
    );
  },
);
