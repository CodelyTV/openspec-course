# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Below it, the outfits the product belongs to (with the current product marked), or the collection suggestions when it belongs to none.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/admin` — Admin overview: metrics, low stock and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock and an "In outfit" tag when its product belongs to an outfit.
- `/admin/outfits` — Admin outfits: every outfit with its product count and a warning naming its sold-out pieces.
- `/admin/outfits/new` — Create an outfit: a name and 2 to 4 products.
- `/admin/outfits/[id]` — Edit or delete an outfit.
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
