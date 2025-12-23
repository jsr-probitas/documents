---
paths: "main.ts, lib/**/*.ts, templates/**/*.tsx, scripts/**/*.ts"
---

# Site Architecture

## Directory Structure

```
documents/
├── main.ts                      # Entry point (Deno.serve)
├── deno.json                    # Project configuration
├── docs/                        # Markdown documentation source
├── data/
│   ├── api/                     # Generated API JSON (deno doc --json)
│   ├── index/                   # Example scenario index files
│   └── docs.ts                  # Documentation pages configuration
├── templates/                   # Hono JSX components
│   ├── api/                     # API reference page templates
│   ├── docs/                    # Documentation page templates
│   ├── Layout.tsx               # Main layout component
│   ├── HomeLayout.tsx           # Home page layout
│   ├── components.tsx           # Shared UI components
│   ├── home.tsx                 # Home page template
│   └── scripts.ts               # Client-side JavaScript (theme, carousel, etc.)
├── lib/                         # Core modules
│   ├── api-docs.ts              # API documentation types & utilities
│   ├── api-markdown.ts          # API markdown generation
│   ├── markdown.ts              # Markdown processing & link rewriting
│   ├── llms.ts                  # LLM-friendly endpoints generation
│   ├── signature-formatters.ts  # Type signature formatting
│   └── type-references.ts       # Type reference resolution
├── static/                      # Static assets (CSS, images, favicon)
├── scripts/                     # Build and generation scripts
│   ├── build.ts                 # SSG build + Pagefind indexing
│   └── generate-api-docs.ts     # Fetch & process API docs from JSR
├── tests/                       # Integration tests
└── probitas/                    # Example Probitas scenarios
```

## Routes

| Path                        | Format   | Description                |
| --------------------------- | -------- | -------------------------- |
| `/`                         | HTML     | Landing page               |
| `/index.md`                 | Markdown | Overview for LLMs          |
| `/llms.txt`                 | Text     | LLM site map               |
| `/docs/*`                   | HTML     | Documentation pages        |
| `/docs/*.md`                | Markdown | Raw markdown for LLMs      |
| `/api/`                     | HTML     | API reference index        |
| `/api/{package}/`           | HTML     | Package API reference      |
| `/api/{package}/index.json` | JSON     | Raw API data               |
| `/api/{package}/index.md`   | Markdown | API documentation for LLMs |

## Build Workflow

### 1. API Documentation Generation

```bash
deno task generate-api
```

Runs `scripts/generate-api-docs.ts`:

1. Fetches all `@probitas/*` packages from JSR API
2. Runs `deno doc --json` for each package
3. Processes and filters exports (removes private items, imports, etc.)
4. Saves to `data/api/{package}.json`
5. Generates `data/api/index.json` with package metadata

### 2. Static Site Generation

```bash
deno task build
```

Runs `scripts/build.ts`:

1. **SSG**: Uses Hono's `toSSG()` to generate HTML/JSON/Markdown files
2. **Asset Copy**: Copies `static/` contents to `dist/static/`
3. **Search Index**: Runs Pagefind to generate searchable index

## Client-Side Features

The site includes JavaScript functionality (see `templates/scripts.ts`):

- **Theme switching**: Light/dark mode with localStorage persistence
- **Code highlighting**: Dynamic highlight.js loading with theme sync
- **Code copy buttons**: Copy-to-clipboard for code blocks
- **Carousel**: Interactive example carousel on home page
- **Scroll indicators**: Fade effects for scrollable navigation
