# retail-specs

OpenSpec store `retail-specs` for the retail system: every change and spec lives here. Plan changes that span repos from here. The code repos point at this store from their `openspec/config.yaml`, so a change that only touches one of them can be planned from inside that repo.

# Repos

Sibling folders, each its own git repo:

- `../retail-api`: HTTP JSON API (Next.js route handlers, PostgreSQL, :3001). Owns business logic and data. Its HTTP contract lives in `../retail-api/docs/http/contract.md`.
- `../retail-web`: storefront and `/admin` backoffice (Next.js, :3000). No database; reads and writes everything through `retail-api` at `RETAIL_API_URL`.

Before editing a repo, read its `AGENTS.md`: it holds that repo's commands, architecture and docs map, and it is only loaded when you read it.

# Git flow

1. Use the change name as the branch name in every repo the change touches.
2. Open a PR in retail-specs with the plan (proposal, design, specs, tasks) and merge it early.
3. Open one PR per touched code repo; link the PRs to each other and to the plan.
4. Once every code PR is merged to main, archive the change and open a final PR in retail-specs with the archive.
