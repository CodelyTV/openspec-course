import { beforeEach, describe, expect, it } from "vitest";

import { CartVariantAdder } from "@/contexts/backend/checkout/application/add/CartVariantAdder";
import { Checkout } from "@/contexts/backend/checkout/domain/Checkout";
import type { CheckoutCatalog } from "@/contexts/backend/checkout/domain/CheckoutCatalog";
import { CheckoutId } from "@/contexts/backend/checkout/domain/CheckoutId";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import { CatalogItemNotFoundError } from "@/contexts/backend/checkout/domain/errors/CatalogItemNotFoundError";
import { VariantOutOfStockError } from "@/contexts/backend/checkout/domain/errors/VariantOutOfStockError";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { EmptyStringValueObjectError } from "@/contexts/shared/domain/errors/EmptyStringValueObjectError";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";
import { CatalogItemMother } from "../../domain/CatalogItemMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CartVariantAdder should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const catalog = Mock.create<CheckoutCatalog>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const idGenerator = Mock.create<IdGenerator>();
	const adder = new CartVariantAdder(
		checkoutRepository,
		catalog,
		currentUserProvider,
		idGenerator,
	);
	const userId = new UserId("user-aibuilder");
	const newCheckoutId = "5f0c9d8e-2b7a-4c1d-8e3f-6a9b0c1d2e3f";

	function catalogItemWithUnitsLeft(unitsLeft: number): {
		productId: string;
		variantId: string;
	} {
		const item = CatalogItemMother.create({ variantId: "v1", unitsLeft });
		catalog.searchItemsShouldReturn([item]);

		return { productId: item.productId, variantId: "v1" };
	}

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
		idGenerator.generateShouldReturn(newCheckoutId);
	});

	it("add an in-stock variant to a new cart owned by the current user", async () => {
		const { productId, variantId } = catalogItemWithUnitsLeft(5);
		checkoutRepository.searchByUserShouldReturn(null);

		await adder.add(variantId);

		checkoutRepository.expectSaveToHaveBeenCalledWith(
			Checkout.create(new CheckoutId(newCheckoutId), userId).addVariant(
				productId,
				new VariantId(variantId),
			),
		);
	});

	it("add one more unit when the variant is already in the cart and stock allows it", async () => {
		const { productId, variantId } = catalogItemWithUnitsLeft(3);
		const checkout = CheckoutMother.create({
			userId: userId.value,
			lines: [{ productId, variantId, quantity: 2 }],
		});
		checkoutRepository.searchByUserShouldReturn(checkout);

		await adder.add(variantId);

		checkoutRepository.expectSaveToHaveBeenCalledWith(
			CheckoutMother.create({
				...checkout.toPrimitives(),
				lines: [{ productId, variantId, quantity: 3 }],
			}),
		);
	});

	it("fail when the units already in the cart use up the online stock", async () => {
		const { productId, variantId } = catalogItemWithUnitsLeft(2);
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({
				userId: userId.value,
				lines: [{ productId, variantId, quantity: 2 }],
			}),
		);

		await expect(adder.add(variantId)).rejects.toBeInstanceOf(
			VariantOutOfStockError,
		);
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when the variant is out of stock", async () => {
		const { variantId } = catalogItemWithUnitsLeft(0);
		checkoutRepository.searchByUserShouldReturn(null);

		await expect(adder.add(variantId)).rejects.toBeInstanceOf(
			VariantOutOfStockError,
		);
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when the variant is not in the catalog", async () => {
		catalog.searchItemsShouldReturn([]);

		await expect(adder.add("ghost")).rejects.toBeInstanceOf(
			CatalogItemNotFoundError,
		);
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when the variant id is blank", async () => {
		await expect(adder.add("  ")).rejects.toBeInstanceOf(
			EmptyStringValueObjectError,
		);
		catalog.expectSearchItemsNotToHaveBeenCalled();
	});
});
