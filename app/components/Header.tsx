/**
 * Global header navigation component
 */
import { basePath } from "../lib/path.js";
import { docPages } from "../../data/docs.js";

const GITHUB_URL = "https://github.com/probitas-test/probitas";

interface HeaderProps {
  /** Current page identifier for active nav state */
  current?: string;
}

export function Header({ current }: HeaderProps) {
  return (
    <header class="global-header">
      <a href={basePath("/")} class="logo">
        <img
          src={basePath("/probitas.png")}
          alt="Probitas"
          class="logo-img"
        />
        <span class="logo-text">Probitas</span>
      </a>
      <button
        type="button"
        class="mobile-menu-toggle"
        onclick="toggleMobileMenu()"
        aria-label="Toggle menu"
      >
        <i class="ti ti-menu-2 icon-menu" />
        <i class="ti ti-x icon-close" />
      </button>
      <nav class="header-nav">
        {docPages.map((doc) => (
          <a
            key={doc.path}
            href={basePath(doc.path)}
            aria-current={current === doc.path ? "page" : undefined}
          >
            {doc.label}
          </a>
        ))}
        <a
          href={basePath("/api")}
          aria-current={current === "/api" ? "page" : undefined}
        >
          API
        </a>
      </nav>
      <div class="header-right">
        <button
          type="button"
          class="search-toggle"
          onclick="openSearch()"
          aria-label="Search"
        >
          <i class="ti ti-search" />
          <span class="search-shortcut">⌘K</span>
        </button>
        <button
          type="button"
          class="theme-toggle"
          onclick="toggleTheme()"
          aria-label="Toggle theme"
        >
          <i class="ti ti-sun icon-sun" />
          <i class="ti ti-moon icon-moon" />
        </button>
        <a
          href={GITHUB_URL}
          class="github-link"
          target="_blank"
          rel="noopener"
        >
          <i class="ti ti-brand-github" />
          <span class="github-text">GitHub</span>
        </a>
      </div>
    </header>
  );
}
