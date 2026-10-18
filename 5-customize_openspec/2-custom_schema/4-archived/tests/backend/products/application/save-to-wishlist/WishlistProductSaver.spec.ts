import { beforeEach, describe, expect, it } from "vitest";

import { WishlistProductSaver } from "@/contexts/backend/products/application/save-to-wishlist/WishlistProductSaver";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { WishlistRepository } from "@/contexts/backend/products/domain/WishlistRepository";
import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { WishlistItemMother } from "../../domain/WishlistItemMother";

describe("WishlistProductSaver should", () => {
	const wishlistRepository = Mock.create<WishlistRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const clock = Mock.create<Clock>();
	const saver = new WishlistProductSaver(
		wishlistRepository,
		productRepository,
		currentUserProvider,
		clock,
	);
	const userId = new UserId("user-aibuilder");
	const now = new Date("2026-10-18T09:30:00.000Z");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
		clock.nowShouldReturn(now);
	});

	it("save the product in the current customer's wishlist, at the current time", async () => {
		productRepository.searchShouldReturn(
			ProductMother.create({ id: "hexagonal-overshirt" }),
		);

		await saver.save("hexagonal-overshirt");

		productRepository.expectSearchToHaveBeenCalledWith(
			new ProductId("hexagonal-overshirt"),
		);
		wishlistRepository.expectSaveToHaveBeenCalledWith(
			WishlistItemMother.create({
				userId: userId.value,
				productId: "hexagonal-overshirt",
				savedAt: now.toISOString(),
			}),
		);
	});

	it("reject a product that is not in the catalog and save nothing", async () => {
		productRepository.searchShouldReturn(null);

		await expect(saver.save("ghost")).rejects.toBeInstanceOf(
			ProductNotFoundError,
		);
		wishlistRepository.expectSaveNotToHaveBeenCalled();
	});
});
