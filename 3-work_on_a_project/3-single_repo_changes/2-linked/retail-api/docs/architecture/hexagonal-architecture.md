# 🎯 Architecture: Hexagonal architecture (DDD)

## 💡 Convention

Each backend bounded context under `src/contexts/backend/<context>/` has three layers:

- `domain/` — aggregates, value objects, repository ports (abstract classes) and domain errors. No framework or database imports.
- `application/` — one use case per folder, named after the action (e.g. `application/search/ProductsSearcher.ts`). Use cases receive their ports through the constructor and return response DTOs or primitives, never domain objects.
- `infrastructure/` — adapters implementing the domain ports, mainly PostgreSQL repositories built on `backend/shared/infrastructure/PostgresRepository.ts`.

Dependencies point inwards: `infrastructure` → `application` → `domain`, never the other way.

When a use case must change several aggregates atomically, it depends on the `UnitOfWork` port (`src/contexts/shared/domain/UnitOfWork.ts`) and wraps the work in `unitOfWork.run(...)`. `PostgresUnitOfWork` opens a transaction that every repository built on `PostgresRepository` joins automatically; repositories use `this.sql` (never the raw connection) so they take part in it.

`src/contexts/backend/shared/infrastructure/RetailContainer.ts` is the composition root: it wires every use case with its adapters. Route handlers in `src/app/` resolve use cases through `retailContainer` and never instantiate repositories or use cases themselves. When you add a use case, register it there.

HTTP adapters live in `src/contexts/backend/shared/infrastructure/http/`. Route handlers stay thin: parse and validate the request (`requestBody.ts`), call one use case and serialize its response DTO; `withErrorHandling` maps domain errors to the error body and status codes of [../http/contract.md](../http/contract.md).

### Collaboration between bounded contexts

When a context (the consumer) needs something from another (the provider):

- The consumer declares a port in its own `domain/`, named and shaped for its own needs (e.g. Checkout's `CheckoutCatalog` returns `CatalogItem`, not a Products aggregate). Rules about that data (e.g. `CatalogItems` throwing `CatalogItemNotFoundError`) live in the consumer too.
- An adapter in the consumer's `infrastructure/` implements the port by calling a provider's public use case in its `application/` layer (e.g. `ProductsCheckoutCatalog` → `VariantsSearcher`) and mapping its response DTO. The adapter is wired in `RetailContainer`.
- Never import another context's `domain/` or `infrastructure/`: no foreign repositories, aggregates or errors. Code outside `infrastructure/` never imports another context at all.
- The shared kernel (`src/contexts/shared/domain/`) only holds identifiers used across contexts (`UserId`, `ProductId`, `VariantId`), the `CurrentUserProvider` session port every context needs, and generic primitives (`Money`, `Clock`, `UnitOfWork`, ...). No business rules.
- Data the consumer must remember is copied at the time it happens, not joined later: order lines store product name, color and size when the order is placed, so order history survives catalog changes.
- A cross-context flow that must be atomic still runs inside one `UnitOfWork` (e.g. `CheckoutConfirmer`); the providers' repositories join the transaction.

These rules are enforced by the `no-restricted-imports` rule in `eslint.config.mjs`.

## 🏆 Benefits

- Business rules are testable without a database or framework, by mocking the ports.
- Adapters (e.g. the PostgreSQL repositories) can change without touching the domain or the use cases.
- One use case per folder makes every capability easy to find and review.
- A single composition root keeps wiring in one place and routes thin.
- Consumer-owned ports keep contexts decoupled: a provider can change its model as long as its use cases keep their contract, and consumers are unit-tested by mocking only their own ports.

## 👀 Examples

### ✅ Good: Use case depending on a domain port and returning a DTO

```ts
export class ProductFinder {
  constructor(private readonly repository: ProductRepository) {}

  async find(id: string): Promise<ProductResponse | null> {
    const product = await this.repository.search(new ProductId(id));

    return product ? toProductResponse(product) : null;
  }
}
```

### ❌ Bad: Route wiring infrastructure and leaking domain objects

```ts
export async function GET(_request: Request, { params }: ProductRouteContext) {
  const repository = new PostgresProductRepository(new PostgresConnection());
  const product = await repository.search(new ProductId((await params).id));

  return Response.json(product);
}
```

### ✅ Good: Consumer-owned port adapted to the provider's use case

```ts
// checkout/domain/CheckoutCatalog.ts
export abstract class CheckoutCatalog {
  abstract searchItems(variantIds: VariantId[]): Promise<CatalogItem[]>;
}

// checkout/infrastructure/ProductsCheckoutCatalog.ts
export class ProductsCheckoutCatalog extends CheckoutCatalog {
  constructor(private readonly variantsSearcher: VariantsSearcher) {
    super();
  }
  // maps VariantResponse to CatalogItem
}
```

### ❌ Bad: Use case depending on another context's repository and aggregate

```ts
import { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

export class CheckoutConfirmer {
  constructor(private readonly productRepository: ProductRepository) {}
  // reads Product aggregates and decreases their stock directly
}
```

## 🧐 Real world examples

- [ProductRepository.ts](../../src/contexts/backend/products/domain/ProductRepository.ts) (domain port)
- [ProductFinder.ts](../../src/contexts/backend/products/application/find/ProductFinder.ts) (use case)
- [ProductResponse.ts](../../src/contexts/backend/products/application/ProductResponse.ts) (response DTO)
- [PostgresProductRepository.ts](../../src/contexts/backend/products/infrastructure/PostgresProductRepository.ts) (adapter)
- [RetailContainer.ts](../../src/contexts/backend/shared/infrastructure/RetailContainer.ts) (composition root)
- [products/[id]/route.ts](../../src/app/products/[id]/route.ts) + [withErrorHandling.ts](../../src/contexts/backend/shared/infrastructure/http/withErrorHandling.ts) (thin route handler)
- [CheckoutConfirmer.ts](../../src/contexts/backend/checkout/application/confirm/CheckoutConfirmer.ts) (use case running inside a `UnitOfWork`, depending only on Checkout-owned ports)
- [CheckoutCatalog.ts](../../src/contexts/backend/checkout/domain/CheckoutCatalog.ts) + [ProductsCheckoutCatalog.ts](../../src/contexts/backend/checkout/infrastructure/ProductsCheckoutCatalog.ts) (consumer-owned port + adapter over `VariantsSearcher`)
- [StockReserver.ts](../../src/contexts/backend/checkout/domain/StockReserver.ts) + [ProductsStockReserver.ts](../../src/contexts/backend/checkout/infrastructure/ProductsStockReserver.ts), [OrderPlacement.ts](../../src/contexts/backend/checkout/domain/OrderPlacement.ts) + [OrdersOrderPlacement.ts](../../src/contexts/backend/checkout/infrastructure/OrdersOrderPlacement.ts)
- [CustomerDirectory.ts](../../src/contexts/backend/orders/domain/CustomerDirectory.ts) + [UsersCustomerDirectory.ts](../../src/contexts/backend/orders/infrastructure/UsersCustomerDirectory.ts) (Orders port adapted to Users' `UsersByIdsSearcher`)
- [OrderLine.ts](../../src/contexts/backend/orders/domain/OrderLine.ts) (snapshots product name, color and size)
- [UserId.ts](../../src/contexts/shared/domain/UserId.ts) (shared kernel identifier)

## 🔗 Related agreements

- [Project layout](./project-layout.md)
- [HTTP contract](../http/contract.md)
- [Testing strategy](../testing/testing-strategy.md)
