# Architecture: Project layout

- `src/app/` — App Router routes, server actions (`src/app/actions/`: they return an `ActionState` for `useActionState` and map domain errors to user-facing messages in `actionStateFor.ts`) and route-local `*.module.scss` styles.
- `src/contexts/backend/` — business logic by bounded context (`products`, `checkout`, `orders`, `users`), each split into `domain/application/infrastructure`. See [hexagonal-architecture.md](./hexagonal-architecture.md).
- `src/contexts/frontend/` — `design-system/` (the Codely design system: settings, atoms, molecules, icons; its Sass `settings/` are the single source of the design tokens, exposed as CSS custom properties in `generic/_base.scss`) and `retail/` (app-specific sections, UI components and frontend application logic).
- `src/contexts/shared/` — domain primitives shared across contexts (value objects).
- `database/` — `schema.sql` and `seed.sql`, applied by the `db:*` npm scripts.
- `tests/` — mirrors `src/` (`backend/`, `frontend/`, `shared/`, `app/`); `tests/shared/Mock.ts` is the shared mocking helper. See [../testing/testing-strategy.md](../testing/testing-strategy.md).
- `public/products/` — placeholder product images (see `public/products/CREDITS.md`).
