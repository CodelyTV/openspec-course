# Proposal

## Why

The product page only suggests other products from the same collection ("You might also like"), so customers never see how pieces combine into a complete look. Admins have no way to curate those combinations: the backoffice is read-only today.

## What Changes

- New **outfits**: a named, ordered combination of 2 to 4 distinct catalog products, curated by admins. Outfits are inspiration only; they cannot be bought as a whole.
- Outfit names are unique across all outfits, ignoring case and leading or trailing spaces. Creation and editing reject names used by another outfit; deleting an outfit releases its name.
- The product page (`/products/[id]`) gets a new section that shows every outfit the product belongs to, rendering each piece as a product card (sold-out pieces stay visible as "Sold out") and marking the product being viewed. The section is hidden when the product is in no outfit. "You might also like" stays as it is.
- New backoffice panel "Outfits" (`/admin/outfits`) to list, create, edit and delete outfits. This is the first admin flow that writes data; `/admin` stays without roles or authentication, like the rest of the backoffice.
- New `outfits` bounded context that references products by id and reaches the catalog only through the products application layer.
- Seed data with sample outfits.

Out of scope: buying a whole outfit, outfits pinned to specific colors or variants, cleaning outfits up when a product is deleted (there is no product deletion flow), and search or drag-and-drop when picking pieces.

## Capabilities

### New Capabilities

- `outfit-management`: admins curate outfits from the backoffice: list, create, edit and delete them, with the rules every outfit must satisfy (non-empty and unique name, number of pieces, distinct and existing products, order).
- `outfit-suggestions`: customers see, on a product page, the complete outfits that product belongs to.

### Modified Capabilities

None.

## Impact

- **Backend**: new `src/contexts/backend/outfits/` context (domain, application, infrastructure); new products use case to search products by ids; wiring in `RetailContainer`; `outfits` added to `backendContexts` in `eslint.config.mjs`.
- **Database**: new `outfits` and `outfit_products` tables in `database/schema.sql`, a unique index on normalized outfit names to protect concurrent saves, sample outfits with distinct names in `database/seed.sql`.
- **Frontend**: new section on `src/app/products/[id]/page.tsx`; new `src/app/admin/outfits/` routes and server actions; new "Outfits" entry in `AdminNav`; first form input atoms in the design system.
- **Docs**: `docs/architecture/screens.md`, `docs/architecture/project-layout.md`, `CLAUDE.md` (context list) and `docs/sql-database/data-model.md`.
