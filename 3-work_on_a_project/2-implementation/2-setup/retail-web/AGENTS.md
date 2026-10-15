# Useful commands

```bash
npm install
npm run dev              # local dev server (http://localhost:3000), needs retail-api at RETAIL_API_URL
npm run build            # production build
npm run typecheck        # type-check only
npm run lint             # ESLint + Prettier (lint:fix to auto-fix)
npm run test             # unit + frontend tests
make checks              # lint:fix + build + test
```

# Architecture

- Next.js 16 (App Router) web app: the storefront and the `/admin` backoffice. It has no database or business logic of its own.
- All data comes from `retail-api` over HTTP (`RETAIL_API_URL`, default `http://localhost:3001`; see `.env.example`), through the server-only client `src/contexts/frontend/retail/api/RetailApi.ts`.
- Frontend routes and server actions in `src/app/` (`src/app/actions/`). Server components and server actions call `retailApi`; client components never do.
- API response types live in `src/contexts/frontend/retail/api/responses.ts`; API errors arrive as `RetailApiError` and server actions map them to user-facing messages by their `type`.

# Documentation

- Detailed conventions with examples live in `docs/`.
- **Do NOT read all docs upfront.**
- When working on a task, use this map to find and read only the docs relevant to your task:

```
docs/
├── documentation-guidelines.md
├── architecture/
│   ├── project-layout.md
│   └── screens.md
└── testing/
    └── testing-strategy.md
```
