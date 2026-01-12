/**
 * Documentation overview route
 *
 * Renders the overview.md file with full Layout.
 * This is the main entry point for the documentation section.
 */
import { createRoute } from "honox/factory";
import { MarkdownDocFromFile } from "../../templates/docs/MarkdownDoc.tsx";

export default createRoute(async (c) => {
  const content = await MarkdownDocFromFile(
    "./docs/overview.md",
    "Overview",
    "/docs/",
    "Introduction to Probitas, quick start, and core concepts",
  );
  return c.html(content);
});
