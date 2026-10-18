import { beforeEach, describe, expect, it } from "vitest";

import { WishlistProductChecker } from "@/contexts/backend/products/application/check-wishlist/WishlistProductChecker";
import type { WishlistRepository } from "@/contexts/backend/products/domain/WishlistRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";

describe("WishlistProductChecker should", () => {
	const wishlistRepository = Mock.create<WishlistRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const checker = new WishlistProductChecker(
		wishlistRepository,
		currentUserProvider,
	);
	const currentCustomerId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentCustomerId);
	});

	it("tell that a product saved by the current customer is saved", async () => {
		wishlistRepository.hasShouldReturn(true);

		expect(await checker.isSaved("event-storm-knit")).toBe(true);
		wishlistRepository.expectHasToHaveBeenCalledWith(
			currentCustomerId,
			new ProductId("event-storm-knit"),
		);
	});

	it("tell that a product only saved by another customer is not saved", async () => {
		wishlistRepository.hasShouldReturn(false);

		expect(await checker.isSaved("event-storm-knit")).toBe(false);
		wishlistRepository.expectHasToHaveBeenCalledWith(
			currentCustomerId,
			new ProductId("event-storm-knit"),
		);
	});
});
