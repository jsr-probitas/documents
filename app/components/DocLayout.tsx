/**
 * Two-column documentation layout component
 */
import type { Child } from "hono/jsx";

interface DocLayoutProps {
  /** Sidebar content (typically TableOfContents) */
  sidebar: Child;
  /** Main content area */
  children: Child;
}

/**
 * Renders a two-column layout with sidebar and main content
 */
export function DocLayout({ sidebar, children }: DocLayoutProps) {
  return (
    <div class="content-layout">
      <aside class="content-sidebar">{sidebar}</aside>
      <main class="content-main">{children}</main>
    </div>
  );
}
