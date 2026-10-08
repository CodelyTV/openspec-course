# HTTP: Contract

Base URL `http://localhost:3001`, no `/api` prefix. JSON in and out. Success bodies are the use case response DTOs as they are (no envelope). The only consumer is the `retail-web` server (server components and server actions), so there is no CORS.

## Errors

Every error body is `{ "error": { "type": string, "message": string } }`. `type` is the domain error class name and is part of the contract: renaming an error class or its `type` breaks the consumer. Mapping lives in `src/contexts/backend/shared/infrastructure/http/httpErrorResponse.ts`.

| Status | `type`                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400    | `InvalidArgumentError` (malformed JSON, wrong body shape, invalid query), `EmptyStringValueObjectError`, `InvalidLiteralError`, `InvalidMoneyAmountError`                                                                   |
| 403    | `ProductNotPurchasedError` (only customers who bought a product can review it)                                                                                                                                              |
| 404    | `ProductNotFoundError`, `OutfitNotFoundError`, `OrderNotFoundError`, `UserNotFoundError`, `ReviewNotFoundError`                                                                                                             |
| 409    | `VariantOutOfStockError`, `CheckoutConcurrentModificationError`, `EmptyCheckoutError`, `OutfitNameAlreadyExistsError`, `ReviewAlreadyExistsError`, `ReviewAlreadyModeratedError`                                            |
| 422    | `InvalidOutfitNameError`, `InvalidOutfitSizeError`, `RepeatedOutfitProductError`, `OutfitProductNotFoundError`, `CatalogItemNotFoundError`, `InvalidReviewRatingError`, `InvalidReviewTitleError`, `InvalidReviewBodyError` |
| 500    | `InternalServerError` for anything else (message is never leaked)                                                                                                                                                           |

## Endpoints

`/me/**` endpoints act on the current user, resolved inside the API through `CurrentUserProvider`; the client never sends a user id.

| Method + path                              | Use case                   | Request                                                              | Success                                                                                    |
| ------------------------------------------ | -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `GET /products?collection=&category=`      | `ProductsSearcher`         | optional filters                                                     | 200 `ProductResponse[]`                                                                    |
| `GET /products/{id}`                       | `ProductFinder`            |                                                                      | 200 `ProductResponse`, 404 if missing                                                      |
| `GET /products/{id}/suggestions`           | `ProductSuggestionsFinder` |                                                                      | 200 `ProductSuggestionsResponse`                                                           |
| `GET /products/{id}/reviews`               | `ProductReviewsFinder`     |                                                                      | 200 `ProductReviewsResponse` (no reviews and `averageRating: null` for an unknown product) |
| `GET /categories`                          | `CategoriesLister`         |                                                                      | 200 `string[]`                                                                             |
| `GET /collections`                         | `CollectionsLister`        |                                                                      | 200 `string[]`                                                                             |
| `GET /inventory`                           | `InventoryLister`          |                                                                      | 200 `InventoryReportResponse`                                                              |
| `GET /inventory/low-stock`                 | `LowStockLister`           |                                                                      | 200 `LowStockReportResponse`                                                               |
| `GET /outfits`                             | `OutfitsLister`            |                                                                      | 200 `OutfitSummaryResponse[]`                                                              |
| `POST /outfits`                            | `OutfitCreator`            | `{ name: string, productIds: string[] }`                             | 201, empty body                                                                            |
| `GET /outfits/{id}`                        | `OutfitFinder`             |                                                                      | 200 `OutfitResponse`, 404 if missing                                                       |
| `PUT /outfits/{id}`                        | `OutfitUpdater`            | `{ name: string, productIds: string[] }`                             | 204                                                                                        |
| `DELETE /outfits/{id}`                     | `OutfitDeleter`            |                                                                      | 204                                                                                        |
| `GET /reviews/pending`                     | `PendingReviewsLister`     |                                                                      | 200 `PendingReviewResponse[]`, oldest first                                                |
| `POST /reviews/{id}/approval`              | `ReviewApprover`           | empty body                                                           | 204                                                                                        |
| `POST /reviews/{id}/rejection`             | `ReviewRejecter`           | empty body                                                           | 204                                                                                        |
| `GET /orders`                              | `OrdersLister`             |                                                                      | 200 `OrderResponse[]`                                                                      |
| `GET /orders/recent?limit=`                | `RecentOrdersLister`       | required positive integer `limit`                                    | 200 `OrderResponse[]`                                                                      |
| `GET /orders/summary`                      | `OrdersSummaryGetter`      |                                                                      | 200 `OrdersSummaryResponse`                                                                |
| `GET /orders/{id}`                         | `OrderFinder`              |                                                                      | 200 `OrderDetailResponse`, 404 if missing                                                  |
| `GET /me`                                  | `CurrentUserGetter`        |                                                                      | 200 `CurrentUserResponse`                                                                  |
| `GET /me/orders`                           | `UserOrdersLister`         |                                                                      | 200 `MyOrderResponse[]`                                                                    |
| `GET /me/orders/{id}`                      | `UserOrderFinder`          |                                                                      | 200 `OrderDetailResponse`, 404 if missing or owned by another user                         |
| `GET /me/products/{id}/review-eligibility` | `ReviewEligibilityChecker` |                                                                      | 200 `ReviewEligibilityResponse`                                                            |
| `POST /me/reviews`                         | `ReviewSubmitter`          | `{ productId: string, rating: number, title: string, body: string }` | 201, empty body                                                                            |
| `GET /me/checkout`                         | `CheckoutViewGetter`       |                                                                      | 200 `CheckoutResponse`                                                                     |
| `GET /me/checkout/item-count`              | `CartItemCounter`          |                                                                      | 200 `{ itemCount: number }`                                                                |
| `POST /me/checkout/lines`                  | `CartVariantAdder`         | `{ variantId: string }`                                              | 204                                                                                        |
| `DELETE /me/checkout/lines/{variantId}`    | `CartVariantRemover`       |                                                                      | 204, also when the variant is not in the cart                                              |
| `POST /me/checkout/confirmation`           | `CheckoutConfirmer`        | empty body                                                           | 201 `{ orderId: string }`                                                                  |

## Review responses

`rating` is a whole number of stars from 1 to 5. `title` (1–100 characters) and `body` (1–2000 characters) are trimmed before they are checked (422 when out of range); a non-number `rating` is a 400. `averageRating` covers approved reviews only, rounded to one decimal. Reviews on the product page are approved only, newest first.

```ts
type ReviewResponse = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};
type ProductReviewsResponse = {
  averageRating: number | null;
  reviewCount: number;
  reviews: ReviewResponse[];
};
type ReviewEligibilityStatus =
  "can-review" | "not-purchased" | "awaiting-moderation" | "already-reviewed";
type ReviewEligibilityResponse = { status: ReviewEligibilityStatus };
type PendingReviewResponse = ReviewResponse & {
  productId: string;
  productName: string;
};
```
