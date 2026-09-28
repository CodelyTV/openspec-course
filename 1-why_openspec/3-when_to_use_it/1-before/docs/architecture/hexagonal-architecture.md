# 🎯 Architecture: Hexagonal architecture (DDD)

## 💡 Convention

Each backend bounded context under `src/contexts/backend/<context>/` has three layers:

- `domain/` — aggregates, value objects, repository ports (abstract classes) and domain errors. No framework or database imports.
- `application/` — one use case per folder, named after the action (e.g. `application/search/ProductsSearcher.ts`). Use cases receive their ports through the constructor and return response DTOs or primitives, never domain objects.
- `infrastructure/` — adapters implementing the domain ports, mainly PostgreSQL repositories built on `backend/shared/infrastructure/PostgresRepository.ts`.

Dependencies point inwards: `infrastructure` → `application` → `domain`, never the other way. Domain primitives shared across contexts live in `src/contexts/shared/domain/`.

When a use case must change several aggregates atomically, it depends on the `UnitOfWork` port (`src/contexts/shared/domain/UnitOfWork.ts`) and wraps the work in `unitOfWork.run(...)`. `PostgresUnitOfWork` opens a transaction that every repository built on `PostgresRepository` joins automatically; repositories use `this.sql` (never the raw connection) so they take part in it.

`src/contexts/backend/shared/infrastructure/RetailContainer.ts` is the composition root: it wires every use case with its adapters. Routes and server actions in `src/app/` resolve use cases through `retailContainer` and never instantiate repositories or use cases themselves. When you add a use case, register it there.

Frontend code follows the same split: `src/contexts/frontend/retail/` holds the app-specific `application/`, `sections/` and `ui/` code, while `src/contexts/frontend/design-system/` is app-agnostic and must not import from `retail/`.

## 🏆 Benefits

- Business rules are testable without a database or framework, by mocking the ports.
- Adapters (e.g. the PostgreSQL repositories) can change without touching the domain or the use cases.
- One use case per folder makes every capability easy to find and review.
- A single composition root keeps wiring in one place and routes thin.

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

```tsx
export default async function ProductPage({ params }: ProductPageProps) {
  const repository = new PostgresProductRepository(new PostgresConnection());
  const product = await repository.search(new ProductId((await params).id));
  // ...
}
```

## 🧐 Real world examples

- [ProductRepository.ts](../../src/contexts/backend/products/domain/ProductRepository.ts) (domain port)
- [ProductFinder.ts](../../src/contexts/backend/products/application/find/ProductFinder.ts) (use case)
- [ProductResponse.ts](../../src/contexts/backend/products/application/ProductResponse.ts) (response DTO)
- [PostgresProductRepository.ts](../../src/contexts/backend/products/infrastructure/PostgresProductRepository.ts) (adapter)
- [RetailContainer.ts](../../src/contexts/backend/shared/infrastructure/RetailContainer.ts) (composition root)
- [CheckoutConfirmer.ts](../../src/contexts/backend/checkout/application/confirm/CheckoutConfirmer.ts) (use case running inside a `UnitOfWork`)

## 🔗 Related agreements

- [Project layout](./project-layout.md)
- [Testing strategy](../testing/testing-strategy.md)
