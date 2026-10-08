# 🎯 Testing: Testing strategy

## 💡 Convention

Tests live in `tests/`, mirroring `src/` (`tests/backend/**` ↔ `src/contexts/backend/**`, `tests/frontend/**` ↔ `src/contexts/frontend/**`, `tests/shared/**` ↔ `src/contexts/shared/**`, `tests/app/**` ↔ `src/app/**`). `tests/shared/Mock.ts` is the shared mocking helper. Vitest runs three projects (see `vitest.config.ts`):

| Project       | Files                                                                                       | Environment | Command                    |
| ------------- | ------------------------------------------------------------------------------------------- | ----------- | -------------------------- |
| `unit`        | `tests/**/*.spec.ts`, except `tests/**/infrastructure/**` and `tests/backend/acceptance/**` | node        | `npm run test`             |
| `frontend`    | `tests/**/*.spec.tsx`                                                                       | jsdom       | `npm run test`             |
| `integration` | `tests/**/infrastructure/**/*.spec.ts`, `tests/backend/acceptance/**/*.spec.ts`             | node        | `npm run test:integration` |

Integration tests need the database up and the test database created (`npm run db:test:reset`); they run against `retail_test_opus`, never the dev database.

### Backend

- **Unit**: test every use case through its public API, mocking its own context's domain ports with `Mock.create<T>()` and its helpers (`<method>ShouldReturn`, `expect<Method>ToHaveBeenCalledWith`). Domain classes are covered through the use cases, not tested directly.
- **Object mothers**: build aggregates and entities with a mother next to the mirrored domain (`tests/backend/<context>/domain/<Name>Mother.ts`, `tests/shared/domain/MoneyMother.ts`), never by hand. Ids and simple value objects (`new UserId("user-1")`) may be built directly.
- **Integration**: every Postgres repository is tested against `retail_test_opus`, arranging data with mothers and the repository itself (no raw SQL). Data whose repository has no `save` (users, products) is arranged with `RetailEnvironmentArranger` (`givenUsers`, `givenProducts`).
- **Acceptance**: cross-context flows live in `tests/backend/acceptance/` and wire the real use cases, adapters and Postgres repositories of every involved context (e.g. `CheckoutConfirmation.spec.ts`: checkout → products stock → orders inside one `UnitOfWork`). Only time, ids and the current user are mocked.
- **Deterministic**: tests control time and generated ids instead of depending on the real clock or random values. Faker runs with a fixed seed (`tests/setupFaker.ts`, loaded by every Vitest project).

### Frontend

"The more your tests resemble the way your software is used, the more confidence they can give you." Test behaviour, not implementation: query by role/label, interact with `@testing-library/user-event`, assert what the user sees. No snapshots, no testing internal state or hooks.

- **Client components**: Testing Library + `user-event`; mock at the server action module boundary (`vi.mock("@/app/actions/...", () => ({ ... }))`, so `RetailContainer` and `server-only` are never imported); cover error and pending states.
- **Presentational components**: render with props and assert visible output, including empty states. Build props with the response mothers in `tests/frontend/retail/responses/` (one `<Name>ResponseMother` per response DTO, whatever context the DTO comes from).
- **Pure UI logic** (e.g. `format.ts`): plain unit tests.
- **Design system**: only components with behaviour.
- **Async Server Components / pages**: not tested. Pages stay thin: they fetch through `RetailContainer` and hand data to tested components; any logic goes to a use case or a component.
- No E2E tests.

## 🏆 Benefits

- Use case tests document the behaviour of the application without coupling to domain internals, so refactors don't break them.
- Mothers and `Mock` keep tests short and focused on the scenario being tested.
- Integration tests prove the SQL against a real database while unit tests stay fast.
- User-centric frontend tests survive markup and state refactors and catch accessibility regressions.

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

### ✅ Good: Component tested the way a user uses it

```tsx
render(
  <ProductPurchasePanel
    product={product}
    initialVariantId={soldOutVariantId}
  />,
);

expect(screen.getByRole("button", { name: "Sold out" })).toBeDisabled();
```

### ❌ Bad: Snapshot or implementation details

```tsx
const { container } = render(<ProductPurchasePanel {...props} />);

expect(container).toMatchSnapshot();
```

## 🧐 Real world examples

- [ProductFinder.spec.ts](../../tests/backend/products/application/find/ProductFinder.spec.ts)
- [ProductMother.ts](../../tests/backend/products/domain/ProductMother.ts)
- [Mock.ts](../../tests/shared/Mock.ts)
- [format.spec.ts](../../tests/frontend/retail/ui/format.spec.ts)
- [ProductPurchasePanel.spec.tsx](../../tests/app/products/[id]/ProductPurchasePanel.spec.tsx)
- [AddToCartForm.spec.tsx](../../tests/app/products/[id]/AddToCartForm.spec.tsx)
- [CheckoutConfirmation.spec.ts](../../tests/backend/acceptance/CheckoutConfirmation.spec.ts)
- [CustomerOrdersTable.spec.tsx](../../tests/frontend/retail/sections/CustomerOrdersTable.spec.tsx)

## 🔗 Related agreements

- [Hexagonal architecture](../architecture/hexagonal-architecture.md)
