# Tasks

## 1. Products: search by ids

- [x] 1.1 Add `ProductsByIdsSearcher` in `products/application/search-by-ids/` (dedupe ids, empty list short-circuit, unknown ids skipped) and verify with a unit test in `tests/backend/products/application/search-by-ids/` using `Mock.create<ProductRepository>()` and `ProductMother`
- [x] 1.2 Register `productsByIdsSearcher` in `RetailContainer` and verify `npm run typecheck` passes

## 2. Outfits domain and persistence

- [x] 2.1 Add `"outfits"` to `backendContexts` in `eslint.config.mjs` and verify `npm run lint` passes
- [x] 2.2 Create the `outfits` domain: `OutfitId`, `OutfitName` (throws `EmptyOutfitNameError`), `Outfit` (2-4 products, no repeats, ordered; `fromPrimitives`/`toPrimitives`), its errors including `OutfitNameAlreadyExistsError`, `OutfitRepository` (including `searchByName(name)` returning `Outfit | null`) and the `OutfitCatalog` port; add `OutfitMother` in `tests/backend/outfits/domain/` and verify `npm run typecheck` passes
- [x] 2.3 Add the `outfits` and `outfit_products` tables to `database/schema.sql` (including the `drop table if exists` lines) and the `outfits_name_unique` index on `lower(btrim(name))`; verify `npm run db:reset` and `npm run db:test:reset` succeed
- [x] 2.4 Implement `PostgresOutfitRepository` (`save` upsert by id + replace pieces in a transaction, `search`, `searchByName` using `lower(btrim(...))` for both stored and supplied names, `searchAll`, `searchContaining`, `delete`); translate only unique violations for `outfits_name_unique` into `OutfitNameAlreadyExistsError` after rollback. Verify integration tests in `tests/backend/outfits/infrastructure/` cover piece order, replacing pieces on re-save, search by product, normalized name lookup, duplicate creation and renaming, rollback preserving existing name and pieces, reuse after deletion, and concurrent duplicate saves with exactly one success and one domain error (`npm run test:integration`)
- [x] 2.5 Implement `ProductsOutfitCatalog` over `ProductsByIdsSearcher` and verify `npm run typecheck` passes

## 3. Outfits use cases

- [x] 3.1 Add `OutfitResponse` and `OutfitCreator` (generated id, rejects unknown products with `OutfitProductNotFoundError`, checks `searchByName` and rejects duplicate names with `OutfitNameAlreadyExistsError`) and verify unit tests cover a valid outfit, each composition rule and duplicate rejection without saving
- [x] 3.2 Add `OutfitUpdater` (keeps id, `OutfitNotFoundError` for unknown ids, same rules as creation, allows its own name but rejects a name owned by a different outfit) and verify with unit tests, including unchanged names and changes only to case or surrounding spaces
- [x] 3.3 Add `OutfitDeleter`, `OutfitFinder`, `OutfitsLister` and `ProductOutfitsFinder` (lists ordered by name) and verify with unit tests, including `OutfitFinder` returning null for an unknown id
- [x] 3.4 Register `outfitRepository`, the private `outfitCatalog` and the six outfits use cases in `RetailContainer` and verify `npm run typecheck` passes
- [x] 3.5 Add the acceptance test `tests/backend/acceptance/OutfitCreation.spec.ts` wiring `OutfitCreator` with the real `ProductsOutfitCatalog` and Postgres repositories, covering a saved outfit, an unknown product rejected and duplicate-name rejection including case and surrounding-space variations, and verify `npm run test:integration` passes

## 4. Product page: outfits section

- [x] 4.1 Add an optional `isCurrent` prop to `ProductCard` that shows a "You're viewing this" marker and verify existing frontend tests still pass
- [x] 4.2 Add `OutfitResponseMother` in `tests/frontend/retail/responses/` and the `ProductOutfits` section in `src/contexts/frontend/retail/sections/` and verify with a frontend test covering piece order, current product marker, sold-out piece, missing piece skipped, several outfits and the empty state rendering nothing
- [x] 4.3 Render `ProductOutfits` on `src/app/products/[id]/page.tsx` between the purchase details and "You might also like", composing `productOutfitsFinder` and `productsByIdsSearcher`, and verify on `npm run dev` that a seeded product shows its outfits and a product in no outfit shows none
- [x] 4.4 Add sample outfits with distinct normalized names to `database/seed.sql` (at least two, one product shared by both) and verify `npm run db:reset` loads them
- [x] 4.5 Update `docs/architecture/screens.md` (product detail section) and `docs/sql-database/data-model.md` (new tables, no FK to products, unique normalized outfit names) and verify the descriptions match the implemented behavior

## 5. Backoffice: manage outfits

- [x] 5.1 Add the `TextField` and `Select` atoms to `src/contexts/frontend/design-system/atoms/` and verify `npm run lint` and `npm run typecheck` pass
- [x] 5.2 Add `src/app/actions/outfits/` (`outfitFormData`, `createOutfit`, `updateOutfit`, `deleteOutfit`) with user-facing messages for every outfits error via `actionStateFor`, including "An outfit with this name already exists." for `OutfitNameAlreadyExistsError` from either pre-check or persistence in create/update; revalidate the layout and redirect to `/admin/outfits` after create/update, and verify `npm run typecheck` passes
- [x] 5.3 Add the `OutfitForm` client component (controlled name and 4 ordered piece selects with a "None" option) and verify with a frontend test that submits the filled slots in order, keeps entered values and shows the error on failure including duplicate-name errors for creation and editing, and shows the pending state
- [x] 5.4 Add `/admin/outfits` with an `OutfitsTable` (name, pieces count, edit link, delete form, create action, empty state) and verify with a frontend test for the list, the empty state and the delete action
- [x] 5.5 Add `/admin/outfits/new` and `/admin/outfits/[id]/edit` (pre-filled, `notFound()` for unknown ids) and verify on `npm run dev` that creating, editing and deleting an outfit is reflected on the panel and on product pages
- [x] 5.6 Add the "Outfits" entry to `AdminNav` and verify the updated `tests/app/admin/AdminNav.spec.tsx` passes
- [x] 5.7 Update `docs/architecture/screens.md` (admin outfits screens), `docs/architecture/project-layout.md` and `CLAUDE.md` (new `outfits` context) and verify they list the new screens and context

## 6. Integration check

- [x] 6.1 Run `make checks` and `npm run test:integration` and verify both pass
