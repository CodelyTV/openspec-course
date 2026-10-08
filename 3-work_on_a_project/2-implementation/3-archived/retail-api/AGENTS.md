# Useful commands

```bash
npm install
npm run db:up            # start PostgreSQL (Docker)
npm run db:reset         # load schema + seed
npm run dev              # local API server (http://localhost:3001)
npm run build            # production build
npm run start            # serve the production build (http://localhost:3001)
npm run typecheck        # type-check only
npm run lint             # ESLint + Prettier (lint:fix to auto-fix)
npm run test             # unit tests (use cases + route handlers)
npm run db:test:reset    # create/reset the retail_test database
npm run test:integration # needs db:test:reset
make checks              # lint:fix + build + test
```

# Architecture

- HTTP JSON API built with Next.js 16 route handlers only (no pages or UI), Hexagonal Architecture, DDD. Its only client is the `retail-web` server.
- Route handlers in `src/app/**/route.ts`, kept thin: parse input, call one use case through `retailContainer`, map errors with `withErrorHandling` (`src/contexts/backend/shared/infrastructure/http/`).
- Backend business logic in `src/contexts/backend/`, split by bounded context (`products`, `checkout`, `orders`, `users`, `reviews`), each with `domain/application/infrastructure`.
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
│   └── project-layout.md
├── http/
│   └── contract.md
├── sql-database/
│   └── data-model.md
└── testing/
    └── testing-strategy.md
```

# Planning

- Specs and changes live in the `retail-specs` OpenSpec store (sibling folder `../retail-specs`). This repo's `openspec/` is only a pointer to that store, so OpenSpec commands run here act on `retail-specs`.
- For work that spans repos, open the agent in `../retail-specs` and plan there.
