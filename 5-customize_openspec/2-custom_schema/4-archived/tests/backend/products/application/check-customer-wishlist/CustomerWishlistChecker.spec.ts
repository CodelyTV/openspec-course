import { beforeEach, describe, expect, it } from "vitest";

import { CustomerWishlistChecker } from "@/contexts/backend/products/application/check-customer-wishlist/CustomerWishlistChecker";
import type { WishlistRepository } from "@/contexts/backend/products/domain/WishlistRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";

describe("CustomerWishlistChecker should", () => {
	const wishlistRepository = Mock.create<WishlistRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const checker = new CustomerWishlistChecker(
		wishlistRepository,
		currentUserProvider,
	);
	const currentCustomerId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentCustomerId);
	});

	it("return true when the current customer saved the product", async () => {
		wishlistRepository.containsShouldReturn(true);

		expect(await checker.isSaved("merge-conflict-jeans")).toBe(true);
		wishlistRepository.expectContainsToHaveBeenCalledWith(
			currentCustomerId,
			new ProductId("merge-conflict-jeans"),
		);
	});

	it("return false when only another customer saved it", async () => {
		wishlistRepository.containsShouldReturn(false);

		expect(await checker.isSaved("domain-event-tee")).toBe(false);
		wishlistRepository.expectContainsToHaveBeenCalledWith(
			currentCustomerId,
			new ProductId("domain-event-tee"),
		);
	});
});
