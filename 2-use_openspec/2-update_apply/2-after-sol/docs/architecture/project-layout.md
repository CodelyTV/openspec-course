# Architecture: Project layout

- `src/app/` — App Router routes, server actions (`src/app/actions/`: they return an `ActionState` for `useActionState` and map domain errors to user-facing messages in `actionStateFor.ts`) and route-local `*.module.scss` styles.
- `src/contexts/backend/` — business logic by bounded context (`products`, `checkout`, `orders`, `users`, `outfits`), each split into `domain/application/infrastructure`. See [hexagonal-architecture.md](./hexagonal-architecture.md).
- `src/contexts/frontend/` — `design-system/` (the Codely design system: settings, atoms, molecules, icons; its Sass `settings/` are the single source of the design tokens, exposed as CSS custom properties in `generic/_base.scss`) and `retail/` (app-specific sections and UI components).
- `src/contexts/shared/domain/` — shared kernel: identifiers used across contexts (`UserId`, `ProductId`, `VariantId`), the `CurrentUserProvider` session port, and generic primitives (`Money`, `Clock`, `UnitOfWork`, ...).
- `database/` — `schema.sql` and `seed.sql`, applied by the `db:*` npm scripts.
- `tests/` — mirrors `src/` (`backend/`, `frontend/`, `shared/`, `app/`), plus `tests/backend/acceptance/` for cross-context flows; `tests/shared/Mock.ts` is the shared mocking helper. See [../testing/testing-strategy.md](../testing/testing-strategy.md).
- `public/products/` — placeholder product images (see `public/products/CREDITS.md`).
