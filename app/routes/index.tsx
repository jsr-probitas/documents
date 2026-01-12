/**
 * Home page route
 *
 * Returns raw HTML since HomePage() already includes the full HomeLayout
 * with its distinct design:
 * - Absolute positioned header (overlays hero)
 * - No logo in header (hero has the branding)
 * - Full-width sections
 */
import { createRoute } from "honox/factory";
import { HomePage } from "../templates/home.tsx";

export default createRoute(async (c) => {
  const content = await HomePage();
  return c.html(content);
});
