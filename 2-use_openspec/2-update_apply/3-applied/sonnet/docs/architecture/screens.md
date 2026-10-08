# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Suggests the outfits the product belongs to (each shown complete, the viewed product marked), or other products of its collection when it is in no outfit.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/admin` — Admin overview: metrics, low stock (tagged with the number of outfits of each product) and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock, tagged "In outfit" when its product belongs to one.
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
- `/admin/outfits` — Admin outfits: every outfit with its number of products and a warning naming the pieces that are sold out in every variant; link to create one.
- `/admin/outfits/new` — Admin new outfit: name and 2 to 4 products.
- `/admin/outfits/[id]` — Admin edit outfit: change its name and products, or delete it.
