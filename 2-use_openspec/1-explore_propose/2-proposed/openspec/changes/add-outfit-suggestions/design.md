# Design

## Context

See proposal.md for motivation and specs/ for the required behavior.

- The `products` context owns the catalog (`Product`, `ProductRepository`), the product page suggestions (`RelatedProductsFinder` → `searchOthersSameCollectionFirst`) and both stock views (`LowStockLister`, `InventoryLister`).
- The backoffice (`src/app/admin/`) is read-only today. The only server actions are checkout ones; they return an `ActionState` and map domain errors through `actionStateFor`.
- There is no migrations tool: schema changes go into `database/schema.sql` and are re-applied with `db:reset` / `db:test:reset`.
- Contexts collaborate through consumer-owned ports; importing another context's `domain/` or `infrastructure/` is forbidden by ESLint.

## Goals / Non-Goals

**Goals:**
- Model outfits so their rules (2–4 distinct products, unique name) are enforced in the domain and unit-tested through use cases.
- Keep the "outfits or collection" rule in a use case, not in the page.
- Establish the pattern for admin write flows (form + server action + domain errors) that later admin features can follow.

**Non-Goals:**
- Authentication or authorization for the backoffice (it is open today and stays so).
- Reordering pieces with drag and drop; the order is the order of the form fields.
- Searching products in the outfit form (the catalog has ~80 products; a select per piece is enough).
- Pagination of the outfits list.

## Decisions

### 1. `Outfit` is an aggregate inside the `products` context

`Outfit` (`domain/Outfit.ts`), `OutfitId`, `OutfitRepository` port and domain errors live in `src/contexts/backend/products/`.

- **Alternative: a new `outfits` context depending on `products` through a port.** `LowStockLister` and `InventoryLister` (in `products`) need to know whether a product is in an outfit, so `products` would also depend on `outfits`: a cycle between contexts.
- **Alternative: a new context and combining the data in `src/app/` pages.** No cycle, but the "in outfit" and "outfits or collection" rules would leave the backend and go untested.
- Outfits are catalog merchandising with no lifecycle outside the catalog, and every consumer already lives in `products`. A separate context can be extracted later if outfits grow their own concepts (campaigns, pack prices).

`OutfitId` stays local to `products` (not in the shared kernel) because no other context references outfits.

### 2. Persistence: `outfits` + `outfit_products` with cascade

```sql
create table outfits (
	id text primary key,
	name text not null unique
);

create table outfit_products (
	outfit_id text not null references outfits(id) on delete cascade,
	product_id text not null references products(id) on delete cascade,
	position integer not null,
	primary key (outfit_id, product_id)
);
create index outfit_products_product_id_idx on outfit_products(product_id);
```

- `position` keeps the admin's order; the primary key makes a repeated product impossible even outside the domain.
- `on delete cascade` on `product_id` implements "removed catalog products leave outfits" without extra code.
- **Alternative: `product_ids text[]` on `outfits`.** One table, but no foreign keys, no cascade and a GIN index for "outfits of this product". Rejected.
- **Alternative: no FK to products (like `order_lines`).** Orders snapshot history on purpose; outfits are live curation and should follow the catalog. Rejected.

`PostgresOutfitRepository.save` replaces the outfit's rows (`delete` + `insert` of `outfit_products`, upsert of `outfits`) inside `this.transaction(...)`.

### 3. Validation lives in `Outfit.create`; rehydration does not validate

- `Outfit.create(id, name, productIds)` throws `InvalidOutfitNameError` (blank name), `InvalidOutfitSizeError` (not 2–4 products) or `RepeatedOutfitProductError`. Editing goes through the same factory so the rules apply to both.
- `Outfit.fromPrimitives` does **not** validate, because a stored outfit can legitimately have 1 product after a cascade. Visibility rules ask the aggregate instead: `outfit.isDisplayable()` (≥ 2 products).
- Rules that need the repository live in the use cases:
  - `OutfitNameAlreadyExistsError`: `OutfitCreator` / `OutfitUpdater` call `searchByName` and reject when the match is a different outfit. The `unique` constraint is the safety net for races.
  - `OutfitProductNotFoundError`: the use cases check every product id with `ProductRepository.searchByIds`.
  - `OutfitNotFoundError`: updating or deleting a missing outfit.
- **Alternative: rely only on the DB constraint for the name.** It would make the domain depend on a Postgres error code. Rejected.

### 4. Use cases

| Use case | Folder | Returns |
|---|---|---|
| `OutfitsLister` | `application/list-outfits/` | `OutfitSummaryResponse[]` (id, name, productCount), ordered by name |
| `OutfitFinder` | `application/find-outfit/` | `OutfitResponse \| null` (id, name, productIds) for the edit form |
| `OutfitCreator` | `application/create-outfit/` | `void`; id from `IdGenerator` |
| `OutfitUpdater` | `application/update-outfit/` | `void` |
| `OutfitDeleter` | `application/delete-outfit/` | `void` |
| `ProductSuggestionsFinder` | `application/find-suggestions/` | `ProductSuggestionsResponse` |

`ProductSuggestionsResponse` is a discriminated union:

```ts
type ProductSuggestionsResponse =
	| { kind: "outfits"; outfits: OutfitSuggestionResponse[] }
	| { kind: "collection"; products: ProductResponse[] };

type OutfitSuggestionResponse = { name: string; products: ProductResponse[] };
```

`ProductSuggestionsFinder` loads the product's outfits (`OutfitRepository.searchContaining(productId)`), keeps the displayable ones sorted by name, loads their products with one `ProductRepository.searchByIds` and keeps each outfit's order. With no displayable outfit, it falls back to `searchOthersSameCollectionFirst(product, 4)`. It replaces `RelatedProductsFinder`, which is removed together with its test (its behavior moves into the fallback branch).

- **Alternative: decide in `page.tsx`** calling an outfits finder and then `RelatedProductsFinder`. The rule would be untested (pages are not tested). Rejected.

The "currently viewed" mark is decided in the component by comparing ids; the response stays free of view concerns.

### 5. "In outfit" flag enriched in the listers

`LowStockResponse` and `InventoryResponse` gain `inOutfit: boolean`. Both listers receive `OutfitRepository` and call `searchProductIdsInAnyOutfit()` (`select distinct product_id from outfit_products`) once, then check each product against that set. Order and `lowStockCount` are unchanged.

- **Alternative: query in the page and mark rows in the UI.** Moves a rule to `src/app/`. Rejected.

### 6. Backoffice routes and server actions

```
/admin/outfits              list + "New outfit"
/admin/outfits/new          OutfitForm (empty)
/admin/outfits/[id]         OutfitForm (prefilled) + delete
```

- Server actions in `src/app/actions/outfits/`: `createOutfit`, `updateOutfit`, `deleteOutfit`. They read `name` and `productIds` (one select per piece, empty selects ignored) from `FormData`, call the use case, map errors with `actionStateFor` plus action-specific `UserFacingMessages`, then `revalidatePath("/", "layout")` and `redirect("/admin/outfits")`.
- `OutfitForm` is a client component (`useActionState`) in `src/app/admin/outfits/`, with 4 product selects (the first 2 shown as required) fed by `ProductsSearcher`. Fixed 4 selects avoid client-side add/remove state and match the maximum.
- `AdminNav` gets an "Outfits" entry. `OutfitsTable` (presentational) lives in `src/contexts/frontend/retail/sections/`.

### 7. Product page rendering

`src/app/products/[id]/page.tsx` calls `productSuggestionsFinder.find(id)` and renders:
- `kind: "outfits"` → new `OutfitSuggestions` section (eyebrow "Complete the look", one block per outfit with its name and its pieces as `ProductCard`s, the current one marked with "Viewing" and not linked).
- `kind: "collection"` → the existing "You might also like" `ProductGrid` when it has products.

## Risks / Trade-offs

- [Products are only removed directly in the DB, so a 1-product outfit can stay unnoticed] → It is hidden from the product page, still listed in `/admin/outfits` with its product count, so the admin sees "1 product".
- [Race between the name check and the insert] → The `unique` constraint rejects the second write; the repository maps unique-violation on `outfits.name` to `OutfitNameAlreadyExistsError` so the user still gets the friendly message.
- [The tag marks every variant of an outfit product, even sizes that don't affect the look] → Accepted product decision: outfits reference products, not variants.
- [A product in many outfits makes the product page long] → Acceptable with today's catalog size; a cap can be added later without changing the model.

## Migration Plan

- Add the tables to `database/schema.sql` and a few seed outfits to `database/seed.sql`; run `npm run db:reset` and `npm run db:test:reset`.
- No data to migrate. Rollback: revert the commit and reset the database.
