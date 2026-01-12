# Probitas Documentation Site

Documentation for Probitas - a scenario-based testing framework for Deno.

## Quick Reference

- **Runtime**: Node.js + HonoX + Vite SSG
- **API Generation**: Deno (for generate-api-docs.ts)
- **Deploy**: GitHub Pages

## Commands

```bash
npm run dev        # Dev server with HMR
npm run build      # Build static site (client + SSG + Pagefind)
npm run preview    # Preview production build

# API docs generation (requires Deno)
deno run -A scripts/generate-api-docs.ts
```

## Pre-Completion Verification

BEFORE reporting task completion, run and ensure zero errors:

```bash
npm run build
```

## Reference Probitas Packages

When referencing `@probitas/*` API:

- Use `deno doc jsr:@probitas/{package}` for API data
- Check `../probitas/` for core framework source
- Check `../probitas-client/` for client package source
