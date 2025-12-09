import { client, expect, scenario } from "probitas";
import { getPackageList } from "../data/api-pages.ts";
import { docPages } from "../data/docs.ts";

const BASE_URL = Deno.env.get("DOCS_BASE_URL") ?? "http://localhost:8000";

async function loadDocHeadings(): Promise<Record<string, string>> {
  const headings: Record<string, string> = {};
  for (const doc of docPages) {
    try {
      const content = await Deno.readTextFile(
        new URL(doc.file, import.meta.url),
      );
      const match = content.match(/^# .+/m);
      if (match) {
        headings[doc.path] = match[0];
      }
    } catch {
      // Ignore missing local files; remote check will still validate status/ctype
    }
  }
  return headings;
}

const docHeadings = await loadDocHeadings();

export default scenario("Probitas docs site health", {
  tags: ["smoke", "docs"],
})
  .resource("http", () =>
    client.http.createHttpClient({
      url: BASE_URL,
    }))
  .step("serves LLM-friendly markdown at /", async ({ resources }) => {
    const res = await resources.http.get("/", {
      headers: { accept: "text/markdown" },
    });

    expect(res)
      .toBeSuccessful()
      .toHaveStatus(200)
      .toHaveHeader("content-type", /text\/markdown/)
      .toHaveText(/This is a Markdown page for LLMs\./)
      .toHaveText(/# Probitas/);
  })
  .step("serves human homepage HTML", async ({ resources }) => {
    const res = await resources.http.get("/", {
      query: { human: "1" },
      headers: { accept: "text/html" },
    });

    expect(res)
      .toBeSuccessful()
      .toHaveStatus(200)
      .toHaveHeader("content-type", /text\/html/)
      .toHaveText(/Probitas - Scenario-based Testing Framework/)
      .toHaveText(
        /Scenario-based testing framework designed for API, database, and message queue testing/,
      )
      .toHaveText(/AI-Friendly Documentation/);
  })
  .step("exposes raw markdown for docs pages", async ({ resources }) => {
    for (const doc of docPages) {
      const res = await resources.http.get(`${doc.path}.md`);
      const heading = docHeadings[doc.path] ?? "# ";
      expect(res)
        .toBeSuccessful()
        .toHaveStatus(200)
        .toHaveHeader("content-type", /text\/markdown/)
        .toHaveText(new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  })
  .step("renders docs HTML pages", async ({ resources }) => {
    for (const doc of docPages) {
      const res = await resources.http.get(doc.path, {
        headers: { accept: "text/html" },
      });
      expect(res)
        .toBeSuccessful()
        .toHaveStatus(200)
        .toHaveHeader("content-type", /text\/html/)
        .toHaveText(
          new RegExp(doc.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
    }
  })
  .step("provides LLM endpoints", async ({ resources }) => {
    const indexRes = await resources.http.get("/llms.txt");
    expect(indexRes)
      .toBeSuccessful()
      .toHaveStatus(200)
      .toHaveHeader("content-type", /text\/markdown/)
      .toHaveText(/## Documentation/)
      .toHaveText(/## API Reference/);
  })
  .step("renders API index and package JSON", async ({ resources }) => {
    const indexRes = await resources.http.get("/api", {
      headers: { accept: "text/html" },
    });
    expect(indexRes).toBeSuccessful().toHaveStatus(200).toHaveText(
      /API Reference/,
    );

    const packages = await getPackageList();
    for (const pkg of packages) {
      const res = await resources.http.get(`/api/${pkg.name}.json`);
      expect(res)
        .toBeSuccessful()
        .toHaveStatus(200)
        .toHaveHeader("content-type", /application\/json/)
        .toHaveContentContaining({ name: pkg.name, specifier: pkg.specifier });
    }
  })
  .step("renders API markdown endpoints", async ({ resources }) => {
    const packages = await getPackageList();
    for (const pkg of packages) {
      const res = await resources.http.get(`/api/${pkg.name}.md`);
      expect(res)
        .toBeSuccessful()
        .toHaveStatus(200)
        .toHaveHeader("content-type", /text\/markdown/)
        .toHaveText(
          new RegExp(pkg.specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        );
    }
  })
  .step("serves static assets", async ({ resources }) => {
    const res = await resources.http.get("/static/style.css");
    expect(res).toBeSuccessful().toHaveStatus(200).toHaveHeader(
      "content-type",
      /text\/css/,
    );
  })
  .build();
