# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Sold-out colors and sizes stay selectable (labelled "sold out"); for a selected variant without stock, "Notify me when it's back" registers a restock alert of the current customer for it (one per customer and variant, no cancelling) and turns into a disabled "Alert active" button, also on later visits. A product without variants shows a disabled "Sold out" button. Below it, every outfit (≥ 2 products) the product belongs to ("Complete the look", current product marked "Viewing"), or "You might also like" collection suggestions when it belongs to none.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/admin` — Admin overview: metrics, low stock (with an "In N outfits" tag) and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock and a "Waiting" column with the number of customers who have a restock alert for it; variants of outfit products show an "In outfit" tag.
- `/admin/outfits` — Admin outfits: every outfit with its number of products and a warning naming its sold-out pieces.
- `/admin/outfits/new` — Create an outfit: name and 2 to 4 products, each chosen with a picker that filters products by name and shows their photo; products already in the outfit cannot be chosen again.
- `/admin/outfits/[id]` — Edit or delete an outfit: same pickers as creation, prefilled with its pieces (photo and name) in order.
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
