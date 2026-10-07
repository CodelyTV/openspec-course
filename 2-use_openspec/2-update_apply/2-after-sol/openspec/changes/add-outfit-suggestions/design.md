# Design

## Context

See proposal.md for motivation and specs/ for the required behavior. Current state that shapes the approach:

- Backend contexts collaborate only through consumer-owned ports adapted to the provider's `application/` use cases, enforced by `no-restricted-imports` over the `backendContexts` list in `eslint.config.mjs`. `CustomerDirectory` → `UsersByIdsSearcher` is the closest precedent.
- `ProductRepository.searchByIds` already exists, but no products use case exposes it.
- The backoffice (`src/app/admin/`) is read-only and has no forms. Server actions already follow one pattern: `useActionState` + `ActionState { error }` + `actionStateFor(error, messagesOfThisAction)`, then `revalidatePath`/`redirect`.
- The design system only has `Button`, `SubmitButton` and `FormError` for forms; there are no text or select inputs.
- Multi-table aggregates are saved inside `PostgresRepository.transaction` and replace their child rows (`PostgresCheckoutRepository.save` → `replaceLines`).
- `ProductCard` already renders "Sold out" when `totalOnlineStock === 0`.

## Goals / Non-Goals

**Goals:**
- Keep `outfits` a self-contained context that knows products only by `ProductId`.
- Establish a reusable pattern for admin write flows (form atoms, server actions, error mapping).
- Keep pages thin: any composition logic lives in use cases or tested components.

**Non-Goals:**
- Optimistic locking for outfits: the last save wins.
- Pagination or search in the Outfits panel or the piece pickers.
- Snapshotting product data into outfits: pieces are always rendered from the live catalog.

## Decisions

### 1. `outfits` bounded context with an `Outfit` aggregate

```
src/contexts/backend/outfits/
  domain/
    Outfit.ts               id: OutfitId, name: OutfitName, productIds: ProductId[]
    OutfitId.ts, OutfitName.ts
    OutfitRepository.ts     save, search(id), searchByName(name), searchAll, searchContaining(productId), delete(id)
    OutfitCatalog.ts        port: searchExistingProductIds(ids) -> ProductId[]
    errors/                 EmptyOutfitNameError, InvalidOutfitPiecesCountError,
                            RepeatedOutfitProductError, OutfitProductNotFoundError,
                            OutfitNotFoundError, OutfitNameAlreadyExistsError
  application/
    create/OutfitCreator.ts           (IdGenerator, OutfitCatalog)
    update/OutfitUpdater.ts           (OutfitCatalog)
    delete/OutfitDeleter.ts
    find/OutfitFinder.ts              -> OutfitResponse | null
    list/OutfitsLister.ts             -> OutfitResponse[] ordered by name
    find-by-product/ProductOutfitsFinder.ts -> OutfitResponse[] ordered by name
    OutfitResponse.ts                 { id, name, productIds: string[] }
  infrastructure/
    PostgresOutfitRepository.ts
    ProductsOutfitCatalog.ts          adapter over products' ProductsByIdsSearcher
```

The `Outfit` constructor enforces the composition rules: 2 to 4 products, no repeats. `OutfitName` rejects empty or whitespace-only names. The "every product exists" rule needs the catalog, so it lives in the creator and updater: they ask `OutfitCatalog` which ids exist and throw `OutfitProductNotFoundError` for the first missing one. `OutfitUpdater` throws `OutfitNotFoundError` for an unknown id and keeps the outfit's id.

`EmptyOutfitNameError` is its own error rather than the shared `EmptyStringValueObjectError`. The shared one already maps to the generic "invalid request" message, and the form needs "name is required".

Name uniqueness spans all outfits and ignores case and leading or trailing spaces. `OutfitRepository.searchByName(name)` returns an `Outfit | null` using the same normalized comparison as the database index in decision 4. Both creator and updater check it before saving and throw `OutfitNameAlreadyExistsError` if a different outfit owns the name. The updater excludes its own id, allowing unchanged names and changes only to case or surrounding spaces. The aggregate validates the name's non-emptiness; uniqueness is checked through the repository because it involves other aggregates. Display names retain their casing; normalization is only for comparison.

*Alternatives:* putting `Outfit` inside `products` was rejected because outfits are editorial content with their own lifecycle that products should not know about. Validating product existence with a foreign key was rejected because tables owned by different contexts are not linked, as with `order_lines`.

### 2. New products use case `ProductsByIdsSearcher`

`products/application/search-by-ids/ProductsByIdsSearcher.ts` returns `ProductResponse[]` for the given raw ids. It dedupes the ids, returns early for an empty list and skips unknown ids, mirroring `UsersByIdsSearcher`. It serves two consumers:

- `ProductsOutfitCatalog` uses it to validate pieces on write.
- `/products/[id]` uses it to render pieces on read.

### 3. Read side composed in the page, ordering logic in a tested section

```
/products/[id]/page.tsx
  outfits  = productOutfitsFinder.find(product.id)          // ids only
  pieces   = productsByIdsSearcher.search(all outfit productIds)
  <ProductOutfits outfits={outfits} products={pieces} currentProductId={product.id} />
```

`src/contexts/frontend/retail/sections/ProductOutfits.tsx` does the following:

- Maps each outfit's `productIds` to `ProductResponse`s in outfit order and skips ids missing from `products`.
- Marks the current product.
- Renders nothing when `outfits` is empty.

The section sits between the purchase details and "You might also like". `ProductCard` gets an optional `isCurrent` prop that shows a "You're viewing this" marker. Sold-out cards come for free.

*Alternative:* having `ProductOutfitsFinder` return enriched pieces through a port was rejected. On read it would duplicate `ProductResponse` in the outfits context for no gain, and pages composing several use cases is already the documented convention.

### 4. Persistence

```sql
create table outfits (
	id text primary key,
	name text not null
);

create unique index outfits_name_unique on outfits (lower(btrim(name)));

create table outfit_products (
	outfit_id text not null references outfits(id) on delete cascade,
	product_id text not null,          -- no FK: owned by another context
	position integer not null check (position >= 0),
	primary key (outfit_id, product_id),
	unique (outfit_id, position)
);
```

`PostgresOutfitRepository.save` upserts the `outfits` row and replaces its `outfit_products` rows inside `this.transaction`, following the checkout pattern. `searchContaining(productId)` selects outfits with an `exists` subquery on `outfit_products` and loads all their pieces ordered by `position`. `delete` relies on the cascade.

`searchByName` compares `lower(btrim(name))` with `lower(btrim($1::text))`, keeping lookup and enforcement aligned. The unique index protects saves even when concurrent requests both pass the use-case check. After the transaction rolls back, the repository translates only a PostgreSQL unique violation (`23505`) identifying `outfits_name_unique` into `OutfitNameAlreadyExistsError`; unrelated database failures propagate. A rejected save leaves both the outfit and its pieces unchanged. Upserts target the outfit id, so name conflicts never overwrite another outfit. Deleting an outfit releases its name immediately.

### 5. Backoffice routes and server actions

```
/admin/outfits                 OutfitsTable: name, pieces count, Edit link, DeleteOutfitForm
/admin/outfits/new             OutfitForm (empty)
/admin/outfits/[id]/edit       OutfitForm (pre-filled), notFound() when OutfitFinder returns null

src/app/actions/outfits/
  createOutfit.ts   -> outfitCreator.create(name, productIds); redirect("/admin/outfits")
  updateOutfit.ts   -> outfitUpdater.update(id, name, productIds); redirect("/admin/outfits")
  deleteOutfit.ts   -> outfitDeleter.delete(id); revalidatePath("/", "layout")
  outfitFormData.ts -> reads name + piece-0..piece-3, drops empty slots, keeps slot order
```

All three actions call `revalidatePath("/", "layout")`, so product pages drop stale outfits. Only create and update redirect to `/admin/outfits`; delete returns to the panel without a redirect. Domain errors map to user-facing messages through `actionStateFor(error, outfitMessages)`, with one message per error listed in decision 1. `OutfitProductNotFoundError` reuses the wording "One of the products is no longer available."

`OutfitNameAlreadyExistsError` maps to "An outfit with this name already exists." in both create and update actions, including conflicts discovered during persistence. The form keeps the entered name and pieces on this error, just as for other failed submissions.

`OutfitForm` is a client component with `useActionState`. Its name and slot values are controlled state, so the admin's input survives a failed submit: React resets uncontrolled form fields after an action. It renders 4 `Select`s whose options are every catalog product ordered by name (`productsSearcher.search()`), plus a "None" option.

The 4-slot form is what enforces the maximum of 4 in the UI. The domain also enforces it, which covers forged requests.

### 6. Design-system form atoms

The new atoms in `src/contexts/frontend/design-system/atoms/` are `TextField` (label + input) and `Select` (label + select + options). They stay app-agnostic and use the existing design tokens. Because they have no behavior of their own, they get no tests, per the testing strategy.

### 7. Wiring and boundaries

`RetailContainer` gets the following:

- An `outfitRepository`.
- A private `outfitCatalog` built as `new ProductsOutfitCatalog(this.productsByIdsSearcher)`.
- Public getters for the six outfits use cases and `productsByIdsSearcher`.

`"outfits"` is appended to `backendContexts` in `eslint.config.mjs`. `AdminNav` gets `{ href: "/admin/outfits", label: "Outfits" }`.

### 8. Tests

The tests follow `docs/testing/testing-strategy.md`:

- **Unit:** every outfits use case and `ProductsByIdsSearcher`, using `Mock.create` on their ports and an `OutfitMother`.
- **Integration:** `PostgresOutfitRepository` against `retail_test`. The existing arranger already truncates every table.
- **Acceptance:** `OutfitCreation.spec.ts` wires `OutfitCreator` with the real `ProductsOutfitCatalog` → `ProductsByIdsSearcher` → Postgres.
- **Name uniqueness:** unit tests cover creator/updater duplicate rejection and allowing an outfit's own name. Repository integration tests cover normalized lookup, case and surrounding-space duplicates on creation and renaming, rollback of name and piece changes, reuse after deletion, and concurrent saves where exactly one succeeds with the other returning `OutfitNameAlreadyExistsError`. Acceptance tests verify duplicate-name rejection through the real wiring.
- **Frontend:**
  - `ProductOutfits` (order, current marker, sold out, missing piece, empty state).
  - `OutfitForm` (slot ordering via action payload, error and pending states, duplicate-name errors preserving the entered values).
  - `OutfitsTable` (list and empty state).
  - `AdminNav` (new entry).
  - An `OutfitResponseMother` in `tests/frontend/retail/responses/`.

## Risks / Trade-offs

- [Two admins editing the same outfit overwrite each other] → Accepted: no roles and no concurrent admins today. Add a `version` column like `checkouts` if that changes.
- [A product that leaves the catalog leaves dangling `outfit_products` rows, and an outfit could render fewer than 2 pieces] → Accepted: there is no product deletion flow, and the read side skips missing pieces. Cleanup is decided together with a future deletion flow.
- [Selects listing every product will not scale to a big catalog] → Acceptable with 15 products. Swap the `Select` for a searchable picker when the catalog grows, without changing the actions.
- [One extra query per product page] → `ProductsByIdsSearcher` runs only when the product belongs to at least one outfit, with a single `searchByIds` call.

## Migration Plan

No migrations tool exists. Schema changes go into `database/schema.sql` (including the new tables in the `drop table if exists` list) and sample outfits into `database/seed.sql`. Apply them with `npm run db:reset` and `npm run db:test:reset`. To roll back, revert those files and reset again.
