/**
 * API reference index route
 *
 * Lists all @probitas/* packages with their export counts and metadata.
 * Includes full Layout with package navigation sidebar.
 */
import { createRoute } from "honox/factory";
import { ApiIndexPage } from "../../templates/api/ApiPage.tsx";

export default createRoute(async (c) => {
  const content = await ApiIndexPage();
  return c.html(content);
});
