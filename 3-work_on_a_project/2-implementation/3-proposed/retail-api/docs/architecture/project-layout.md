# Architecture: Project layout

- `src/app/` — App Router route handlers only (`**/route.ts`), one folder per HTTP resource (see [../http/contract.md](../http/contract.md)). No pages, layouts or UI.
- `src/contexts/backend/` — business logic by bounded context (`products`, `checkout`, `orders`, `users`), each split into `domain/application/infrastructure`. See [hexagonal-architecture.md](./hexagonal-architecture.md).
- `src/contexts/backend/shared/infrastructure/` — `RetailContainer` (composition root), Postgres plumbing and `http/` (request body parsing and error → HTTP response mapping used by every route handler).
- `src/contexts/shared/domain/` — shared kernel: identifiers used across contexts (`UserId`, `ProductId`, `VariantId`), the `CurrentUserProvider` session port, and generic primitives (`Money`, `Clock`, `UnitOfWork`, ...).
- `database/` — `schema.sql` and `seed.sql`, applied by the `db:*` npm scripts.
- `tests/` — mirrors `src/` (`backend/`, `shared/`, `app/`), plus `tests/backend/acceptance/` for cross-context flows; `tests/shared/Mock.ts` is the shared mocking helper. See [../testing/testing-strategy.md](../testing/testing-strategy.md).
