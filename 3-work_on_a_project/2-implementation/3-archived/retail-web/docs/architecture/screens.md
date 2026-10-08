# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Below it, a "Reviews" section with the average rating and number of approved reviews and every approved review, newest first ("No reviews yet" when there are none); a customer who bought the product and has not reviewed it gets a review form (1–5 stars, title, body), and one who already did sees that their review is awaiting moderation or that they already reviewed the product. Then every outfit (≥ 2 products) the product belongs to ("Complete the look", current product marked "Viewing"), or "You might also like" collection suggestions when it belongs to none.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/admin` — Admin overview: metrics, low stock (with an "In N outfits" tag) and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock; variants of outfit products show an "In outfit" tag.
- `/admin/outfits` — Admin outfits: every outfit with its number of products and a warning naming its sold-out pieces.
- `/admin/outfits/new` — Create an outfit: name and 2 to 4 products, each chosen with a picker that filters products by name and shows their photo; products already in the outfit cannot be chosen again.
- `/admin/outfits/[id]` — Edit or delete an outfit: same pickers as creation, prefilled with its pieces (photo and name) in order.
- `/admin/reviews` — Admin reviews: pending reviews, oldest first, with product, author, date, rating, title and body; each can be approved (shown on its product page) or rejected once ("No reviews to moderate" when the queue is empty).
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
