/**
 * Table of contents navigation component
 */
export interface TocItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: readonly TocItem[];
}

/**
 * Renders a table of contents navigation for documentation pages
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  return (
    <nav class="scrollable-nav toc">
      <h3>On this page</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
