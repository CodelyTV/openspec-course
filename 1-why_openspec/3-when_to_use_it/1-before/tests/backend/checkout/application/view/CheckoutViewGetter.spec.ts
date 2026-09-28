import { beforeEach, describe, expect, it } from "vitest";

import { CheckoutViewGetter } from "@/contexts/backend/checkout/application/view/CheckoutViewGetter";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import { UserId } from "@/contexts/backend/users/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../../products/domain/ProductMother";
import { ProductVariantMother } from "../../../products/domain/ProductVariantMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CheckoutViewGetter should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const getter = new CheckoutViewGetter(
		checkoutRepository,
		productRepository,
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
		productRepository.expectSearchByIdsNotToHaveBeenCalled();
	});

	it("show the cart lines of the products in it sorted by name with their subtotal", async () => {
		const tee = ProductMother.create({
			id: "tee",
			name: "Tee",
			price: { amount: 30, currency: "EUR" },
			variants: [
				ProductVariantMother.createPrimitives({
					id: "tee-m",
					color: "Black",
					size: "M",
				}),
			],
		});
		const hoodie = ProductMother.create({
			id: "hoodie",
			name: "Hoodie",
			price: { amount: 80, currency: "EUR" },
			variants: [
				ProductVariantMother.createPrimitives({
					id: "hoodie-l",
					color: "Ecru",
					size: "L",
				}),
			],
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
		productRepository.searchByIdsShouldReturn([tee, hoodie]);

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
		productRepository.expectSearchByIdsToHaveBeenCalledWith([
			new ProductId("tee"),
			new ProductId("hoodie"),
		]);
	});

	it("fail instead of hiding a line whose product no longer exists", async () => {
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({ userId: userId.value }),
		);
		productRepository.searchByIdsShouldReturn([]);

		await expect(getter.get()).rejects.toBeInstanceOf(ProductNotFoundError);
	});
});
