# 🎯 Testing: Testing strategy

## 💡 Convention

Tests live in `tests/`, mirroring `src/` (`tests/backend/**` ↔ `src/contexts/backend/**`, `tests/shared/**` ↔ `src/contexts/shared/**`, `tests/app/**` ↔ `src/app/**`). `tests/shared/Mock.ts` is the shared mocking helper. Vitest runs two projects (see `vitest.config.ts`):

| Project       | Files                                                                                       | Environment | Command                    |
| ------------- | ------------------------------------------------------------------------------------------- | ----------- | -------------------------- |
| `unit`        | `tests/**/*.spec.ts`, except `tests/**/infrastructure/**` and `tests/backend/acceptance/**` | node        | `npm run test`             |
| `integration` | `tests/**/infrastructure/**/*.spec.ts`, `tests/backend/acceptance/**/*.spec.ts`             | node        | `npm run test:integration` |

Integration tests need the database up and the test database created (`npm run db:test:reset`); they run against `retail_test`, never the dev database.

### Backend

- **Unit**: test every use case through its public API, mocking its own context's domain ports with `Mock.create<T>()` and its helpers (`<method>ShouldReturn`, `expect<Method>ToHaveBeenCalledWith`). Domain classes are covered through the use cases, not tested directly.
- **Object mothers**: build aggregates and entities with a mother next to the mirrored domain (`tests/backend/<context>/domain/<Name>Mother.ts`, `tests/shared/domain/MoneyMother.ts`), and response DTOs with a mother next to the mirrored use case (`tests/backend/orders/application/find/OrderDetailResponseMother.ts`), never by hand. Ids and simple value objects (`new UserId("user-1")`) may be built directly.
- **Integration**: every Postgres repository is tested against `retail_test`, arranging data with mothers and the repository itself (no raw SQL). Data whose repository has no `save` (users, products) is arranged with `RetailEnvironmentArranger` (`givenUsers`, `givenProducts`).
- **Acceptance**: cross-context flows live in `tests/backend/acceptance/` and wire the real use cases, adapters and Postgres repositories of every involved context (e.g. `CheckoutConfirmation.spec.ts`: checkout → products stock → orders inside one `UnitOfWork`). Only time, ids and the current user are mocked.
- **Deterministic**: tests control time and generated ids instead of depending on the real clock or random values. Faker runs with a fixed seed (`tests/setupFaker.ts`, loaded by every Vitest project).

### Route handlers

- One `tests/app/<path>/route.spec.ts` per route file worth testing, in the `unit` project. Call the exported `GET`/`POST`/... with a real `Request` (and `{ params: Promise.resolve({ ... }) }` for dynamic segments) and assert status and JSON body.
- Mock `RetailContainer` at the module boundary (`vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", ...)`) exposing `Mock.create<UseCase>()` instances, so neither Postgres nor `server-only` is loaded. Build response DTOs with the backend mothers (e.g. `toProductResponse(ProductMother.create())`, `OrderDetailResponseMother`).
- Cover the happy path, input validation (400) and the error → status mapping of the use case's domain errors. Business rules stay tested in the use case specs.
- No E2E tests.

## 🏆 Benefits

- Use case tests document the behaviour of the application without coupling to domain internals, so refactors don't break them.
- Mothers and `Mock` keep tests short and focused on the scenario being tested.
- Integration tests prove the SQL against a real database while unit tests stay fast.
- Route handler tests pin the HTTP contract (status codes and error `type`s) the web client depends on.

## 👀 Examples

### ✅ Good: Use case tested through its public API with a mocked port and a mother

```ts
const repository = Mock.create<ProductRepository>();
const finder = new ProductFinder(repository);

it("return null when the product does not exist", async () => {
  repository.searchShouldReturn(null);

  expect(await finder.find("missing")).toBeNull();
});
```

### ❌ Bad: Testing a domain class directly and hand-building fixtures

```ts
it("calculates the subtotal", () => {
  const order = new Order("o1", "u1", [new OrderLine("p1", "v1", 2, 50)]);

  expect(order.subtotal()).toBe(100);
});
```

### ✅ Good: Route handler tested through its exported handler with a mocked use case

```ts
it("respond 404 with a ProductNotFoundError when the product does not exist", async () => {
  productFinder.findShouldReturn(null);

  const response = await GET(new Request("http://localhost/products/missing"), {
    params: Promise.resolve({ id: "missing" }),
  });

  expect(response.status).toBe(404);
  expect((await response.json()).error.type).toBe("ProductNotFoundError");
});
```

## 🧐 Real world examples

- [ProductFinder.spec.ts](../../tests/backend/products/application/find/ProductFinder.spec.ts)
- [ProductMother.ts](../../tests/backend/products/domain/ProductMother.ts)
- [Mock.ts](../../tests/shared/Mock.ts)
- [CheckoutConfirmation.spec.ts](../../tests/backend/acceptance/CheckoutConfirmation.spec.ts)
- [products/[id]/route.spec.ts](../../tests/app/products/[id]/route.spec.ts)
- [outfits/route.spec.ts](../../tests/app/outfits/route.spec.ts)

## 🔗 Related agreements

- [Hexagonal architecture](../architecture/hexagonal-architecture.md)
- [HTTP contract](../http/contract.md)
