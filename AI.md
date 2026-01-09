# AI Scenario Testing Guide

How to let AI assistants write and run Probitas scenario tests.

## Setup for Claude Code (Recommended)

Install the official marketplace and Probitas plugin:

```bash
/plugin marketplace add probitas-test/claude-plugins
/plugin install probitas@probitas-test
```

Enable it in `.claude/settings.json`:

```json
{
  "plugins": {
    "marketplaces": ["probitas-test/claude-plugins"],
    "installed": ["probitas@probitas-test"]
  },
  "enabledPlugins": {
    "probitas@probitas-test": true
  }
}
```

## How to Ask the AI

- Be explicit about the scenario goal, inputs, and expected outcomes.
- Share API/DB schemas or example payloads; do not let the AI guess.
- Provide env vars and endpoints (e.g., `API_URL`) up front.
- Request tags and timeouts if needed (e.g., `tags: ["api", "slow"]`).
- Ask for `ctx.previous` data flow when steps depend on each other.

Example prompt snippet:

> Write a Probitas scenario for POST /users that returns `{ id: number }`. Use
> API_URL env, tag as `api`. Step 1: create user, return id. Step 2: GET by id,
> expect 200 and name match. Use fluent expect chain.

## Scenario Authoring Rules (What the AI must follow)

- Use the `scenario-writer` agent for `*.probitas.ts`.
- Keep steps in one scenario only when they depend on `ctx.previous`; otherwise
  split into separate scenarios.
- Always `export default` and finish builders with `.build()`.
- Register clients with `.resource()` and use env-driven URLs:
  `Deno.env.get("API_URL") ?? "http://localhost:8080"`.
- Use fluent `expect()` chains—no manual `if/throw` checks.
- `.setup()` should return a cleanup function when it creates fixtures.
- One responsibility per step; return data needed by subsequent steps.
- Use tags for filtering and retries/timeouts where appropriate.

## Running and Checking via AI

Claude Code plugin commands:

- `/probitas-init` — initialize a project
- `/probitas-run [selector]` — run scenarios (use selectors/tags to scope)
- `/probitas-list` — list available scenarios
- `/probitas-check` — format, lint, and type-check scenarios
- `/probitas-expect-methods` — get available expect methods

Local probitas CLI commands:

- `probitas init` — initialize a new Probitas project
- `probitas run [paths...] [options]` — run scenarios (use `-s/--selector`)
- `probitas list [paths...]` — list available scenarios
- `probitas fmt` — format scenario files
- `probitas lint` — lint scenario files
- `probitas check` — type-check scenario files

See `probitas <command> -h` for detailed CLI options.

## References to Share with AI

- `/llms.txt` — sitemap for AI agents
- `/docs/scenario/index.md` — scenario authoring guide
- `/docs/client/index.md` — client usage
- `/docs/expect/index.md` — assertion API
- For API details use `deno doc` directly (preferred over Markdown):
  - `deno doc jsr:@probitas/probitas`
  - `deno doc jsr:@probitas/probitas/client/http`
  - `deno doc jsr:@probitas/probitas/expect`

## Links

- Claude Code plugin: https://github.com/probitas-test/claude-plugins
- Probitas documentation: https://probitas-test.github.io/documents
- Probitas repository: https://github.com/probitas-test/probitas
- JSR package: https://jsr.io/@probitas/probitas
