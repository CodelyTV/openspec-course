# Proposal

## Why

The product page only suggests other products from the same collection, which does not help customers buy a complete look. Admins also cannot tell, when restocking, which low-stock products belong to a curated look, so a look can stay incomplete for longer than necessary.

## What Changes

- Introduce **outfits**: a named, admin-curated set of 2 to 4 distinct products (products, not variants). Outfit names are unique.
- New admin section `/admin/outfits` (and an "Outfits" entry in the admin navigation) to list, create, edit and delete outfits. This is the first admin flow that writes data.
- Outfit form: each piece is chosen with a Codely-styled picker that filters products as the admin types their name and shows each product's photo; products already chosen in another piece cannot be picked again, and chosen pieces show their photo in the form.
- Outfits list (`/admin/outfits`): each outfit with a piece that has no stock in any variant shows a warning naming those pieces, so admins can restock or replace them before the look loses sales.
- Product page (`/products/[id]`): when the product belongs to at least one outfit, the "You might also like" collection section is replaced by every outfit the product belongs to, each shown complete, with the current product marked. Out-of-stock pieces are still shown. When the product belongs to no outfit, the collection suggestions are shown as today.
- An outfit left with fewer than 2 products (because a product was removed from the catalog) is not shown on the product page until an admin fixes it.
- Low stock panel (`/admin`): each variant whose product belongs to an outfit shows how many outfits it belongs to (e.g. "In 2 outfits"). Inventory (`/admin/inventory`): each such variant shows an "In outfit" tag. The existing order of both views (stock ascending, then name) does not change.

## Capabilities

### New Capabilities
- `outfit-management`: Admin curation of outfits — what makes an outfit valid (name, number and uniqueness of products) and listing (flagging outfits with sold-out pieces), creating, editing and deleting them from the backoffice.
- `product-suggestions`: What the product page suggests to customers next to the product — today, the outfits the product belongs to, falling back to other products of its collection.
- `stock-monitoring`: How admins see stock in the backoffice — the low stock panel and the inventory, including flagging variants whose product belongs to an outfit.

### Modified Capabilities
<!-- None: there are no existing specs in openspec/specs/. -->

## Impact

- **Database**: new tables `outfits` and `outfit_products` in `database/schema.sql`, plus seed outfits in `database/seed.sql`.
- **Backend (`products` context)**: new `Outfit` aggregate, `OutfitRepository` port with its Postgres adapter, new use cases for outfit management (the outfits lister also reads `ProductRepository` to detect sold-out pieces) and product suggestions; `LowStockLister` responses gain an `outfitCount` and `InventoryLister` responses an `inOutfit` flag. `RetailContainer` wires the new use cases.
- **Frontend**: new `/admin/outfits` pages (the list shows the sold-out warning) and server actions, `AdminNav` entry, `ProductPicker` and `ProductThumbnail` for the outfit form, product page suggestions section, `LowStockPanel` and `InventoryTable` show the tag.
- **Docs**: `docs/architecture/screens.md` and `docs/sql-database/data-model.md` gain the new screens and tables.
- No new dependencies. No breaking changes.
