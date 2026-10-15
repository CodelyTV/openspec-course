# 🎯 Testing: Testing strategy

## 💡 Convention

Tests live in `tests/`, mirroring `src/` (`tests/frontend/**` ↔ `src/contexts/frontend/**`, `tests/app/**` ↔ `src/app/**`). Vitest runs two projects (see `vitest.config.ts`), both with `npm run test`:

| Project    | Files                 | Environment |
| ---------- | --------------------- | ----------- |
| `unit`     | `tests/**/*.spec.ts`  | node        |
| `frontend` | `tests/**/*.spec.tsx` | jsdom       |

No test talks to a running `retail-api`. Faker runs with a fixed seed (`tests/setupFaker.ts`, loaded by every Vitest project).

### Frontend

"The more your tests resemble the way your software is used, the more confidence they can give you." Test behaviour, not implementation: query by role/label, interact with `@testing-library/user-event`, assert what the user sees. No snapshots, no testing internal state or hooks.

- **Client components**: Testing Library + `user-event`; mock at the server action module boundary (`vi.mock("@/app/actions/...", () => ({ ... }))`, so `RetailApi` and `server-only` are never imported); cover error and pending states.
- **Presentational components**: render with props and assert visible output, including empty states. Build props with the response mothers in `tests/frontend/retail/responses/` (one `<Name>ResponseMother` per response type of `src/contexts/frontend/retail/api/responses.ts`).
- **Server actions**: unit tests that mock `@/contexts/frontend/retail/api/RetailApi`, `next/cache` and `next/navigation`, and assert the API call and the `ActionState` for each `RetailApiError` type.
- **API client** (`RetailApi`): unit tests with a stubbed global `fetch` asserting URL, method, body, `no-store` caching and error mapping.
- **Pure UI logic** (e.g. `format.ts`): plain unit tests.
- **Design system**: only components with behaviour.
- **Async Server Components / pages**: not tested. Pages stay thin: they fetch through `retailApi` and hand data to tested components; any logic goes to the API or a component.
- No E2E tests.

## 🏆 Benefits

- Mothers keep tests short and focused on the scenario being tested.
- Mocking at the `RetailApi` and server action boundaries keeps tests fast and independent of a running API.
- User-centric frontend tests survive markup and state refactors and catch accessibility regressions.

## 👀 Examples

### ✅ Good: Server action tested against a mocked `RetailApi`

```ts
addVariant.mockRejectedValue(
  new RetailApiError(422, "CatalogItemNotFoundError", "not found"),
);

expect(
  await addSelectedVariantToCart(initialActionState, formWithVariant("tee-m")),
).toEqual({ error: "The selected variant is no longer available." });
```

### ❌ Bad: Hand-building response fixtures

```ts
const product = { id: "p1", name: "Tee", variants: [], colors: [] } as ProductResponse;
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

- [RetailApi.spec.ts](../../tests/frontend/retail/api/RetailApi.spec.ts)
- [addSelectedVariantToCart.spec.ts](../../tests/app/actions/checkout/addSelectedVariantToCart.spec.ts)
- [ProductResponseMother.ts](../../tests/frontend/retail/responses/ProductResponseMother.ts)
- [format.spec.ts](../../tests/frontend/retail/ui/format.spec.ts)
- [ProductPurchasePanel.spec.tsx](../../tests/app/products/[id]/ProductPurchasePanel.spec.tsx)
- [AddToCartForm.spec.tsx](../../tests/app/products/[id]/AddToCartForm.spec.tsx)
- [CustomerOrdersTable.spec.tsx](../../tests/frontend/retail/sections/CustomerOrdersTable.spec.tsx)

## 🔗 Related agreements

- [Project layout](../architecture/project-layout.md)
