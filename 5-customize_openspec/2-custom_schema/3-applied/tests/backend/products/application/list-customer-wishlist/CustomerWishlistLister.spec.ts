import { beforeEach, describe, expect, it } from "vitest";

import { CustomerWishlistLister } from "@/contexts/backend/products/application/list-customer-wishlist/CustomerWishlistLister";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { WishlistRepository } from "@/contexts/backend/products/domain/WishlistRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";

describe("CustomerWishlistLister should", () => {
	const wishlistRepository = Mock.create<WishlistRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const lister = new CustomerWishlistLister(
		wishlistRepository,
		productRepository,
		currentUserProvider,
	);
	const currentCustomerId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentCustomerId);
	});

	it("return the saved products most recently saved first", async () => {
		const savedProductIds = [
			new ProductId("hexagonal-overshirt"),
			new ProductId("domain-event-tee"),
		];
		wishlistRepository.searchProductIdsOfShouldReturn(savedProductIds);
		productRepository.searchByIdsShouldReturn([
			ProductMother.create({
				id: "domain-event-tee",
				name: "Domain Event Tee",
			}),
			ProductMother.create({
				id: "hexagonal-overshirt",
				name: "Hexagonal Overshirt",
			}),
		]);

		const products = await lister.list();

		expect(products.map((product) => product.name)).toEqual([
			"Hexagonal Overshirt",
			"Domain Event Tee",
		]);
		wishlistRepository.expectSearchProductIdsOfToHaveBeenCalledWith(
			currentCustomerId,
		);
		productRepository.expectSearchByIdsToHaveBeenCalledWith(
			savedProductIds,
		);
	});

	it("return an empty list when nothing is saved", async () => {
		wishlistRepository.searchProductIdsOfShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});
});
