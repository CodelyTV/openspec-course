# Useful commands

```bash
npm install
npm run db:up            # start PostgreSQL (Docker)
npm run db:reset         # load schema + seed
npm run dev              # local dev server (http://localhost:3003)
npm run build            # production build
npm run typecheck        # type-check only
npm run lint             # ESLint + Prettier (lint:fix to auto-fix)
npm run test             # unit + frontend tests
npm run db:test:reset    # create/reset the retail_test_opus database
npm run test:integration # needs db:test:reset
make checks              # lint:fix + build + test
```

# Architecture

- Next.js 16 (App Router), Hexagonal Architecture, DDD.
- Frontend routes and server actions in `src/app/` (`src/app/actions/`).
- Backend business logic in `src/contexts/backend/`, split by bounded context (`products`, `checkout`, `orders`, `users`), each with `domain/application/infrastructure`.
- Shared kernel (cross-context identifiers and generic primitives) in `src/contexts/shared/domain/`.
- Contexts collaborate through consumer-owned ports adapted to the provider's `application/` use cases; never import another context's `domain/` or `infrastructure/` (enforced by ESLint).

# Documentation

- Detailed conventions with examples live in `docs/`.
- **Do NOT read all docs upfront.**
- When working on a task, use this map to find and read only the docs relevant to your task:

```
docs/
├── documentation-guidelines.md
├── architecture/
│   ├── hexagonal-architecture.md
│   ├── project-layout.md
│   └── screens.md
├── sql-database/
│   └── data-model.md
└── testing/
    └── testing-strategy.md
```
