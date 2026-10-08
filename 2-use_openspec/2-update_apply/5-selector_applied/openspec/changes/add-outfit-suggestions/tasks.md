# Tasks

## 1. Database

- [x] 1.1 Add `outfits` and `outfit_products` (FKs with `on delete cascade`, `position`, PK `(outfit_id, product_id)`, index on `product_id`) to `database/schema.sql` as in design.md §2, and verify `npm run db:reset` and `npm run db:test:reset` succeed
- [x] 1.2 Add 2–3 seed outfits to `database/seed.sql` (at least one product in two outfits, one product in none, one outfit with a piece out of stock in every variant) and verify `npm run db:reset` loads them
- [x] 1.3 Make `RetailEnvironmentArranger` clean the new tables between integration tests and verify `npm run test:integration` still passes
- [x] 1.4 Document the new tables in `docs/sql-database/data-model.md` (cascade from products, `position`, unique name) and verify the doc matches `schema.sql`

## 2. Outfit domain and repository

- [x] 2.1 Create `OutfitId`, `Outfit` (`create` validating name, 2–4 products and no repeats; `fromPrimitives` without validation; `isDisplayable()`), `OutfitRepository` port (`save`, `search`, `searchByName`, `searchAll`, `searchContaining`, `countOutfitsByProduct`, `delete`) and the domain errors from design.md §3, plus `Product.isOutOfStock()`, and verify `npm run typecheck` passes and a unit test covers `isOutOfStock()` with all, some and no variants sold out
- [x] 2.2 Add `OutfitMother` in `tests/backend/products/domain/` and verify it builds valid outfits in a throwaway assertion inside the next tasks' tests
- [x] 2.3 Implement `PostgresOutfitRepository` (transactional replace on `save`, products kept in `position` order, unique-violation on name mapped to `OutfitNameAlreadyExistsError`) and verify its integration test covers save/update, search by id and name, `searchContaining`, `countOutfitsByProduct` (products in 0, 1 and 2 outfits), delete, and cascade when a product is deleted

## 3. Outfit management use cases

- [x] 3.1 Implement `OutfitCreator` (name uniqueness, product existence via `ProductRepository.searchByIds`, id from `IdGenerator`) and verify unit tests cover every validation scenario of the outfit-management spec
- [x] 3.2 Implement `OutfitUpdater` (same rules, allows keeping its own name, `OutfitNotFoundError` when missing) and verify unit tests cover the "Edit outfit" and "Unique outfit names" scenarios
- [x] 3.3 Implement `OutfitDeleter`, `OutfitsLister` (ordered by name, with product count and `outOfStockProductNames`) and `OutfitFinder`, and verify their unit tests pass, with `OutfitsLister` covering outfits with no, one and several sold-out pieces (in outfit order) and a piece sold out only in some variants
- [x] 3.4 Register the new use cases and `PostgresOutfitRepository` in `RetailContainer` and verify `npm run build` succeeds

## 4. Backoffice outfits section

- [x] 4.1 Add `createOutfit`, `updateOutfit` and `deleteOutfit` server actions in `src/app/actions/outfits/` with user-facing messages for each outfit error, and verify `npm run typecheck` passes
- [x] 4.2 Build `OutfitsTable` (with empty state and the sold-out warning naming the pieces) in `src/contexts/frontend/retail/sections/` and verify its frontend test covers rows with and without warning and the empty state
- [x] 4.3 Build the client `OutfitForm` (name + 4 product selects, error and pending states) and verify its test, mocking the actions module, covers submit, error message and pending state
- [x] 4.4 Add `/admin/outfits`, `/admin/outfits/new` and `/admin/outfits/[id]` pages (with delete) and the "Outfits" `AdminNav` entry, and verify `AdminNav.spec.tsx` covers the new link and the flow works in `npm run dev`
- [x] 4.5 Document the new screens in `docs/architecture/screens.md` and verify every new route is listed

## 5. Product page suggestions

- [x] 5.1 Implement `ProductSuggestionsFinder` returning the discriminated union from design.md §4, replacing `RelatedProductsFinder` (remove it and its test), and verify unit tests cover every product-suggestions scenario (one/several outfits ordered by name, product order kept, hidden <2 outfits, sold-out pieces kept, collection fallback, product not found)
- [x] 5.2 Add a response mother for `OutfitSuggestionResponse` and build the `OutfitSuggestions` section (outfit name, pieces in order, current product marked "Viewing" and not linked), and verify its frontend test covers the marking and links
- [x] 5.3 Wire `productSuggestionsFinder` in `RetailContainer` and `src/app/products/[id]/page.tsx` (outfits section or existing "You might also like"), and verify both cases in `npm run dev` with the seed data

## 6. Outfit tags in stock views

- [x] 6.1 Add `outfitCount` to `LowStockResponse` and `inOutfit` to `InventoryResponse`, inject `OutfitRepository` in `LowStockLister` and `InventoryLister` (both using `countOutfitsByProduct`), and verify their unit tests cover products in 0, 1 and several outfits and unchanged order
- [x] 6.2 Show the "In N outfit(s)" tag in `LowStockPanel` and the "In outfit" tag in `InventoryTable`, update `LowStockResponseMother` and `InventoryResponseMother`, and verify their frontend tests cover rows without tag, "In 1 outfit", "In 2 outfits" (panel) and with/without "In outfit" (inventory)

## 7. Integration checks

- [x] 7.1 Run `make checks` and `npm run test:integration` and verify both pass

## 8. Visual product picker

- [x] 8.1 Extract `productImageSrc(id)` and build `ProductThumbnail`, use it in `ProductVisual`, and verify the existing `ProductVisual`/`ProductCard` tests still pass
- [x] 8.2 Build `ProductPicker` (combobox + listbox, filtering by name, thumbnails, "No products match", options already in the outfit disabled and skipped by the keyboard, chosen piece with "Remove", hidden `productIds` input) with design-system tokens, and verify its frontend test covers filtering, no match, choosing by click and by keyboard, disabled options, Escape, and removing
- [x] 8.3 Replace the 4 selects in `OutfitForm` with `ProductPicker` slots (first 2 required, prefilled when editing, each receiving the ids chosen in the other slots), and verify the `OutfitForm` test covers submit, error and pending states, the submitted `productIds` order, and that a product chosen in one slot is disabled in the others until removed
- [ ] 8.4 Update `/admin/outfits/new` and `/admin/outfits/[id]` in `docs/architecture/screens.md`, run `make checks`, and verify the create and edit flows in `npm run dev`
