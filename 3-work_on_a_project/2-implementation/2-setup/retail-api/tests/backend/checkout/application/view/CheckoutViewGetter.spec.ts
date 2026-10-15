import { beforeEach, describe, expect, it } from "vitest";

import { CheckoutViewGetter } from "@/contexts/backend/checkout/application/view/CheckoutViewGetter";
import type { CheckoutCatalog } from "@/contexts/backend/checkout/domain/CheckoutCatalog";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import { CatalogItemNotFoundError } from "@/contexts/backend/checkout/domain/errors/CatalogItemNotFoundError";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";
import { CatalogItemMother } from "../../domain/CatalogItemMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CheckoutViewGetter should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const catalog = Mock.create<CheckoutCatalog>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const getter = new CheckoutViewGetter(
		checkoutRepository,
		catalog,
		currentUserProvider,
	);
	const userId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
	});

	it("show an empty draft when the user has no cart yet", async () => {
		checkoutRepository.searchByUserShouldReturn(null);

		expect(await getter.get()).toEqual({
			status: "draft",
			subtotal: null,
			lines: [],
		});
		catalog.expectSearchItemsNotToHaveBeenCalled();
	});

	it("show the cart lines of the items in it sorted by name with their subtotal", async () => {
		const tee = CatalogItemMother.create({
			productId: "tee",
			variantId: "tee-m",
			productName: "Tee",
			color: "Black",
			size: "M",
			unitPrice: { amount: 30, currency: "EUR" },
		});
		const hoodie = CatalogItemMother.create({
			productId: "hoodie",
			variantId: "hoodie-l",
			productName: "Hoodie",
			color: "Ecru",
			size: "L",
			unitPrice: { amount: 80, currency: "EUR" },
		});
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({
				userId: userId.value,
				lines: [
					{ productId: "tee", variantId: "tee-m", quantity: 2 },
					{ productId: "hoodie", variantId: "hoodie-l", quantity: 1 },
				],
			}),
		);
		catalog.searchItemsShouldReturn([tee, hoodie]);

		expect(await getter.get()).toEqual({
			status: "draft",
			subtotal: { amount: 140, currency: "EUR" },
			lines: [
				{
					variantId: "hoodie-l",
					productName: "Hoodie",
					color: "Ecru",
					size: "L",
					quantity: 1,
					price: { amount: 80, currency: "EUR" },
					lineTotal: { amount: 80, currency: "EUR" },
				},
				{
					variantId: "tee-m",
					productName: "Tee",
					color: "Black",
					size: "M",
					quantity: 2,
					price: { amount: 30, currency: "EUR" },
					lineTotal: { amount: 60, currency: "EUR" },
				},
			],
		});
		catalog.expectSearchItemsToHaveBeenCalledWith([
			new VariantId("tee-m"),
			new VariantId("hoodie-l"),
		]);
	});

	it("fail instead of hiding a line whose item is no longer in the catalog", async () => {
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({ userId: userId.value }),
		);
		catalog.searchItemsShouldReturn([]);

		await expect(getter.get()).rejects.toBeInstanceOf(
			CatalogItemNotFoundError,
		);
	});
});
