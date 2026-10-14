# Architecture: Screens

- `/` — Catalog: product cards, prices, badges and a collection filter (`?collection=`).
- `/products/[id]` — Product detail: variants (color/size), online stock and add to cart. Below it, "Reviews": the average rating and number of approved reviews (or "No reviews yet"), below it a rating breakdown of the approved reviews (one row per star rating from 5 to 1 with a proportional bar and its count, not interactive, hidden when there are none) and every approved review, newest first; customers who bought the product and never reviewed it get a review form (1–5 stars, title, body), those with a pending review see that it is awaiting moderation, those with a moderated one see they already reviewed it, and those who never bought it see neither. Then every outfit (≥ 2 products) the product belongs to ("Complete the look", current product marked "Viewing"), or "You might also like" collection suggestions when it belongs to none.
- `/checkout` — Checkout: cart summary, home delivery and order confirmation (`?order=` shows the order just placed).
- `/account/orders` — My orders: the current user's orders.
- `/account/orders/[id]` — Detail of one of the current user's orders.
- `/admin` — Admin overview: metrics, low stock (with an "In N outfits" tag) and recent orders.
- `/admin/inventory` — Admin inventory: every variant with its stock; variants of outfit products show an "In outfit" tag.
- `/admin/outfits` — Admin outfits: every outfit with its number of products and a warning naming its sold-out pieces.
- `/admin/outfits/new` — Create an outfit: name and 2 to 4 products, each chosen with a picker that filters products by name and shows their photo; products already in the outfit cannot be chosen again.
- `/admin/outfits/[id]` — Edit or delete an outfit: same pickers as creation, prefilled with its pieces (photo and name) in order.
- `/admin/reviews` — Admin reviews: the moderation queue, every pending review oldest first (product linking to its page, author, date, stars, title and body) with "Approve" and "Reject"; a moderated review leaves the queue, and an approved one appears on its product page.
- `/admin/orders` — Admin orders: every order.
- `/admin/orders/[id]` — Admin detail of any order.
