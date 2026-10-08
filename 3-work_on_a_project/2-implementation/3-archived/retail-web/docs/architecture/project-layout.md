# Architecture: Project layout

- `src/app/` — App Router routes, server actions (`src/app/actions/`: they return an `ActionState` for `useActionState` and map API error types to user-facing messages in `actionStateFor.ts`) and route-local `*.module.scss` styles.
- `src/contexts/frontend/` — `design-system/` (the Codely design system: settings, atoms, molecules, icons; its Sass `settings/` are the single source of the design tokens, exposed as CSS custom properties in `generic/_base.scss`) and `retail/` (app-specific sections and UI components).
- `src/contexts/frontend/retail/api/` — the `retail-api` HTTP client: `RetailApi.ts` (server-only, reads `RETAIL_API_URL`, never cached, forwards the `cookie`/`authorization` headers of the incoming request), `RetailApiError.ts` (non-2xx responses, carrying the API error `type`) and `responses.ts` (response types copied from the API contract; keep them in sync with it).
- `tests/` — mirrors `src/` (`frontend/`, `app/`). See [../testing/testing-strategy.md](../testing/testing-strategy.md).
- `public/products/` — placeholder product images, served as `/products/<product id>.jpg` (see `public/products/CREDITS.md`).
