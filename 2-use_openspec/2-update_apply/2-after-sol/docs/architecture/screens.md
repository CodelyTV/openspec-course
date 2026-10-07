# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Curated outfits appear before “You might also like”, with pieces in order, a marker on the viewed product and sold-out pieces retained. Missing pieces are skipped; the section is hidden when no outfits contain the product.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/admin` — Admin overview: metrics, low stock and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock.
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
- `/admin/outfits` — Outfits panel: list names and piece counts, create, edit and delete in one action without a confirmation dialog.
- `/admin/outfits/new` — Create an outfit: a name and four ordered product slots, with “None” for unused slots; errors retain entered values.
- `/admin/outfits/[id]/edit` — Edit an outfit with the same pre-filled form; unknown ids show the not-found page.

Outfit management has no roles or authentication, like the other admin panels. Successful writes invalidate the layout so the panel and product suggestions reflect changes.
