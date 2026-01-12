/**
 * Path utilities for handling base URL in GitHub Pages deployment
 */

/**
 * Resolve asset/page path with Vite's BASE_URL.
 *
 * In development: BASE_URL = "/"
 * In production: BASE_URL = "/documents/" (or custom via BASE_PATH env)
 *
 * @example
 * ```ts
 * basePath("/static/logo.png") // => "/documents/static/logo.png" in prod
 * basePath("/docs/")           // => "/documents/docs/" in prod
 * ```
 */
export function basePath(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${cleanPath}`;
}
