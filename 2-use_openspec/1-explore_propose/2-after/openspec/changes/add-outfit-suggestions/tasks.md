# Tasks

## 1. Products: search by ids

- [ ] 1.1 Add `ProductsByIdsSearcher` in `products/application/search-by-ids/` (dedupe ids, empty list short-circuit, unknown ids skipped) and verify with a unit test in `tests/backend/products/application/search-by-ids/` using `Mock.create<ProductRepository>()` and `ProductMother`
- [ ] 1.2 Register `productsByIdsSearcher` in `RetailContainer` and verify `npm run typecheck` passes

## 2. Outfits domain and persistence

- [ ] 2.1 Add `"outfits"` to `backendContexts` in `eslint.config.mjs` and verify `npm run lint` passes
- [ ] 2.2 Create the `outfits` domain: `OutfitId`, `OutfitName` (throws `EmptyOutfitNameError`), `Outfit` (2-6 products, no repeats, ordered; `fromPrimitives`/`toPrimitives`), its errors, `OutfitRepository` and the `OutfitCatalog` port; add `OutfitMother` in `tests/backend/outfits/domain/` and verify `npm run typecheck` passes
- [ ] 2.3 Add the `outfits` and `outfit_products` tables to `database/schema.sql` (including the `drop table if exists` lines) and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [ ] 2.4 Implement `PostgresOutfitRepository` (`save` upsert + replace pieces in a transaction, `search`, `searchAll`, `searchContaining`, `delete`) and verify with an integration test in `tests/backend/outfits/infrastructure/` covering piece order, replacing pieces on re-save, search by product and delete (`npm run test:integration`)
- [ ] 2.5 Implement `ProductsOutfitCatalog` over `ProductsByIdsSearcher` and verify `npm run typecheck` passes

## 3. Outfits use cases

- [ ] 3.1 Add `OutfitResponse` and `OutfitCreator` (generated id, rejects unknown products with `OutfitProductNotFoundError`) and verify unit tests cover a valid outfit and each composition rule from the `outfit-management` spec
- [ ] 3.2 Add `OutfitUpdater` (keeps id, `OutfitNotFoundError` for unknown ids, same rules as creation) and verify with unit tests
- [ ] 3.3 Add `OutfitDeleter`, `OutfitFinder`, `OutfitsLister` and `ProductOutfitsFinder` (lists ordered by name) and verify with unit tests, including `OutfitFinder` returning null for an unknown id
- [ ] 3.4 Register `outfitRepository`, the private `outfitCatalog` and the six outfits use cases in `RetailContainer` and verify `npm run typecheck` passes
- [ ] 3.5 Add the acceptance test `tests/backend/acceptance/OutfitCreation.spec.ts` wiring `OutfitCreator` with the real `ProductsOutfitCatalog` and Postgres repositories, covering a saved outfit and an unknown product rejected, and verify `npm run test:integration` passes

## 4. Product page: outfits section

- [ ] 4.1 Add an optional `isCurrent` prop to `ProductCard` that shows a "You're viewing this" marker and verify existing frontend tests still pass
- [ ] 4.2 Add `OutfitResponseMother` in `tests/frontend/retail/responses/` and the `ProductOutfits` section in `src/contexts/frontend/retail/sections/` and verify with a frontend test covering piece order, current product marker, sold-out piece, missing piece skipped, several outfits and the empty state rendering nothing
- [ ] 4.3 Render `ProductOutfits` on `src/app/products/[id]/page.tsx` between the purchase details and "You might also like", composing `productOutfitsFinder` and `productsByIdsSearcher`, and verify on `npm run dev` that a seeded product shows its outfits and a product in no outfit shows none
- [ ] 4.4 Add sample outfits to `database/seed.sql` (at least two, one product shared by both) and verify `npm run db:reset` loads them
- [ ] 4.5 Update `docs/architecture/screens.md` (product detail section) and `docs/sql-database/data-model.md` (new tables, no FK to products) and verify the descriptions match the implemented behavior

## 5. Backoffice: manage outfits

- [ ] 5.1 Add the `TextField` and `Select` atoms to `src/contexts/frontend/design-system/atoms/` and verify `npm run lint` and `npm run typecheck` pass
- [ ] 5.2 Add `src/app/actions/outfits/` (`outfitFormData`, `createOutfit`, `updateOutfit`, `deleteOutfit`) with user-facing messages for every outfits error via `actionStateFor`, revalidating the layout and redirecting to `/admin/outfits` after create/update, and verify `npm run typecheck` passes
- [ ] 5.3 Add the `OutfitForm` client component (controlled name and 6 ordered piece selects with a "None" option) and verify with a frontend test that submits the filled slots in order, keeps entered values and shows the error on failure, and shows the pending state
- [ ] 5.4 Add `/admin/outfits` with an `OutfitsTable` (name, pieces count, edit link, delete form, create action, empty state) and verify with a frontend test for the list, the empty state and the delete action
- [ ] 5.5 Add `/admin/outfits/new` and `/admin/outfits/[id]/edit` (pre-filled, `notFound()` for unknown ids) and verify on `npm run dev` that creating, editing and deleting an outfit is reflected on the panel and on product pages
- [ ] 5.6 Add the "Outfits" entry to `AdminNav` and verify the updated `tests/app/admin/AdminNav.spec.tsx` passes
- [ ] 5.7 Update `docs/architecture/screens.md` (admin outfits screens), `docs/architecture/project-layout.md` and `CLAUDE.md` (new `outfits` context) and verify they list the new screens and context

## 6. Integration check

- [ ] 6.1 Run `make checks` and `npm run test:integration` and verify both pass
