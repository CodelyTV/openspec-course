import { beforeEach, describe, expect, it } from "vitest";

import { CustomerWishlistFinder } from "@/contexts/backend/products/application/find-customer-wishlist/CustomerWishlistFinder";
import { toProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { WishlistRepository } from "@/contexts/backend/products/domain/WishlistRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";

describe("CustomerWishlistFinder should", () => {
	const wishlistRepository = Mock.create<WishlistRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const finder = new CustomerWishlistFinder(
		wishlistRepository,
		productRepository,
		currentUserProvider,
	);
	const currentCustomerId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentCustomerId);
	});

	it("return the current customer's products, most recently saved first", async () => {
		const overshirt = ProductMother.create({ id: "hexagonal-overshirt" });
		const knit = ProductMother.create({ id: "event-storm-knit" });
		wishlistRepository.searchProductIdsOfShouldReturn([
			new ProductId("event-storm-knit"),
			new ProductId("hexagonal-overshirt"),
		]);
		productRepository.searchByIdsShouldReturn([overshirt, knit]);

		expect(await finder.find()).toEqual([
			toProductResponse(knit),
			toProductResponse(overshirt),
		]);
		wishlistRepository.expectSearchProductIdsOfToHaveBeenCalledWith(
			currentCustomerId,
		);
	});

	it("return nothing when the wishlist is empty", async () => {
		wishlistRepository.searchProductIdsOfShouldReturn([]);

		expect(await finder.find()).toEqual([]);
	});
});
