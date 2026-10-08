# Proposal

## Why

The product page only suggests other products from the same collection, which does not help customers buy a complete look. Admins also cannot tell, when restocking, which low-stock products belong to a curated look, so a look can stay incomplete for longer than necessary.

## What Changes

- Introduce **outfits**: a named, admin-curated set of 2 to 4 distinct products (products, not variants). Outfit names are unique.
- New admin section `/admin/outfits` (and an "Outfits" entry in the admin navigation) to list, create, edit and delete outfits. This is the first admin flow that writes data.
- Product page (`/products/[id]`): when the product belongs to at least one outfit, the "You might also like" collection section is replaced by every outfit the product belongs to, each shown complete, with the current product marked. Out-of-stock pieces are still shown. When the product belongs to no outfit, the collection suggestions are shown as today.
- An outfit left with fewer than 2 products (because a product was removed from the catalog) is not shown on the product page until an admin fixes it.
- Low stock panel (`/admin`) and inventory (`/admin/inventory`): each variant whose product belongs to an outfit shows an "In outfit" tag. The existing order (stock ascending, then name) does not change.

## Capabilities

### New Capabilities
- `outfit-management`: Admin curation of outfits — what makes an outfit valid (name, number and uniqueness of products) and listing, creating, editing and deleting them from the backoffice.
- `product-suggestions`: What the product page suggests to customers next to the product — today, the outfits the product belongs to, falling back to other products of its collection.
- `stock-monitoring`: How admins see stock in the backoffice — the low stock panel and the inventory, including flagging variants whose product belongs to an outfit.

### Modified Capabilities
<!-- None: there are no existing specs in openspec/specs/. -->

## Impact

- **Database**: new tables `outfits` and `outfit_products` in `database/schema.sql`, plus seed outfits in `database/seed.sql`.
- **Backend (`products` context)**: new `Outfit` aggregate, `OutfitRepository` port with its Postgres adapter, new use cases for outfit management and product suggestions; `LowStockLister` and `InventoryLister` responses gain an `inOutfit` flag. `RetailContainer` wires the new use cases.
- **Frontend**: new `/admin/outfits` pages and server actions, `AdminNav` entry, product page suggestions section, `LowStockPanel` and `InventoryTable` show the tag.
- **Docs**: `docs/architecture/screens.md` and `docs/sql-database/data-model.md` gain the new screens and tables.
- No new dependencies. No breaking changes.
