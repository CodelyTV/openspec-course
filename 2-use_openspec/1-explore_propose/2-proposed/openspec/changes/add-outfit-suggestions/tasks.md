# Tasks

## 1. Database

- [ ] 1.1 Add `outfits` and `outfit_products` (FKs with `on delete cascade`, `position`, PK `(outfit_id, product_id)`, index on `product_id`) to `database/schema.sql` as in design.md §2, and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [ ] 1.2 Add 2–3 seed outfits to `database/seed.sql` (at least one product in two outfits, one product in none) and verify `npm run db:reset` loads them
- [ ] 1.3 Make `RetailEnvironmentArranger` clean the new tables between integration tests and verify `npm run test:integration` still passes
- [ ] 1.4 Document the new tables in `docs/sql-database/data-model.md` (cascade from products, `position`, unique name) and verify the doc matches `schema.sql`

## 2. Outfit domain and repository

- [ ] 2.1 Create `OutfitId`, `Outfit` (`create` validating name, 2–4 products and no repeats; `fromPrimitives` without validation; `isDisplayable()`), `OutfitRepository` port (`save`, `search`, `searchByName`, `searchAll`, `searchContaining`, `searchProductIdsInAnyOutfit`, `delete`) and the domain errors from design.md §3, and verify `npm run typecheck` passes
- [ ] 2.2 Add `OutfitMother` in `tests/backend/products/domain/` and verify it builds valid outfits in a throwaway assertion inside the next tasks' tests
- [ ] 2.3 Implement `PostgresOutfitRepository` (transactional replace on `save`, products kept in `position` order, unique-violation on name mapped to `OutfitNameAlreadyExistsError`) and verify its integration test covers save/update, search by id and name, `searchContaining`, `searchProductIdsInAnyOutfit`, delete, and cascade when a product is deleted

## 3. Outfit management use cases

- [ ] 3.1 Implement `OutfitCreator` (name uniqueness, product existence via `ProductRepository.searchByIds`, id from `IdGenerator`) and verify unit tests cover every validation scenario of the outfit-management spec
- [ ] 3.2 Implement `OutfitUpdater` (same rules, allows keeping its own name, `OutfitNotFoundError` when missing) and verify unit tests cover the "Edit outfit" and "Unique outfit names" scenarios
- [ ] 3.3 Implement `OutfitDeleter`, `OutfitsLister` (ordered by name, with product count) and `OutfitFinder`, and verify their unit tests pass
- [ ] 3.4 Register the new use cases and `PostgresOutfitRepository` in `RetailContainer` and verify `npm run build` succeeds

## 4. Backoffice outfits section

- [ ] 4.1 Add `createOutfit`, `updateOutfit` and `deleteOutfit` server actions in `src/app/actions/outfits/` with user-facing messages for each outfit error, and verify `npm run typecheck` passes
- [ ] 4.2 Build `OutfitsTable` (with empty state) in `src/contexts/frontend/retail/sections/` and verify its frontend test covers rows and empty state
- [ ] 4.3 Build the client `OutfitForm` (name + 4 product selects, error and pending states) and verify its test, mocking the actions module, covers submit, error message and pending state
- [ ] 4.4 Add `/admin/outfits`, `/admin/outfits/new` and `/admin/outfits/[id]` pages (with delete) and the "Outfits" `AdminNav` entry, and verify `AdminNav.spec.tsx` covers the new link and the flow works in `npm run dev`
- [ ] 4.5 Document the new screens in `docs/architecture/screens.md` and verify every new route is listed

## 5. Product page suggestions

- [ ] 5.1 Implement `ProductSuggestionsFinder` returning the discriminated union from design.md §4, replacing `RelatedProductsFinder` (remove it and its test), and verify unit tests cover every product-suggestions scenario (one/several outfits ordered by name, product order kept, hidden <2 outfits, sold-out pieces kept, collection fallback, product not found)
- [ ] 5.2 Add a response mother for `OutfitSuggestionResponse` and build the `OutfitSuggestions` section (outfit name, pieces in order, current product marked "Viewing" and not linked), and verify its frontend test covers the marking and links
- [ ] 5.3 Wire `productSuggestionsFinder` in `RetailContainer` and `src/app/products/[id]/page.tsx` (outfits section or existing "You might also like"), and verify both cases in `npm run dev` with the seed data

## 6. "In outfit" tag in stock views

- [ ] 6.1 Add `inOutfit` to `LowStockResponse` and `InventoryResponse`, inject `OutfitRepository` in `LowStockLister` and `InventoryLister`, and verify their unit tests cover tagged/untagged variants and unchanged order
- [ ] 6.2 Show the "In outfit" tag in `LowStockPanel` and `InventoryTable`, update `LowStockResponseMother` and `InventoryResponseMother`, and verify their frontend tests cover rows with and without the tag

## 7. Integration checks

- [ ] 7.1 Run `make checks` and `npm run test:integration` and verify both pass
