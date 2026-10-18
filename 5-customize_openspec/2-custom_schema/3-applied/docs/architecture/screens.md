# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Sold-out colors and sizes stay selectable (labelled "sold out"); for a selected variant without stock, "Notify me when it's back" registers a restock alert of the current customer for it (one per customer and variant, no cancelling) and turns into a disabled "Alert active" button, also on later visits. A product without variants shows a disabled "Sold out" button. Every product, with or without variants, shows a "Save to wishlist" toggle next to the purchase actions that saves the whole product (not a variant) to the current customer's wishlist and turns into "Remove from wishlist", also on later visits. Below it, every outfit (≥ 2 products) the product belongs to ("Complete the look", current product marked "Viewing"), or "You might also like" collection suggestions when it belongs to none.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/account/wishlist` — Wishlist: the current user's saved products, most recently saved first, as product cards linking to their pages; "Your wishlist is empty." with a "Browse the catalog" link when there are none. Reached from the "Wishlist" link in the user menu.
- `/admin` — Admin overview: metrics, low stock (with an "In N outfits" tag) and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock and a "Waiting" column with the number of customers who have a restock alert for it, then a "Wishlisted" column with the number of customers who saved its product to their wishlist (same number on every variant of a product, 0 when nobody did, order unchanged); variants of outfit products show an "In outfit" tag.
- `/admin/outfits` — Admin outfits: every outfit with its number of products and a warning naming its sold-out pieces.
- `/admin/outfits/new` — Create an outfit: name and 2 to 4 products, each chosen with a picker that filters products by name and shows their photo; products already in the outfit cannot be chosen again.
- `/admin/outfits/[id]` — Edit or delete an outfit: same pickers as creation, prefilled with its pieces (photo and name) in order.
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
