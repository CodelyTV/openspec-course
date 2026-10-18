import { describe, it } from "vitest";

import { WishlistProductRemover } from "@/contexts/backend/products/application/remove-from-wishlist/WishlistProductRemover";
import type { WishlistRepository } from "@/contexts/backend/products/domain/WishlistRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";

describe("WishlistProductRemover should", () => {
	const wishlistRepository = Mock.create<WishlistRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const remover = new WishlistProductRemover(
		wishlistRepository,
		currentUserProvider,
	);

	it("remove the product from the current customer's wishlist", async () => {
		const userId = new UserId("user-aibuilder");
		currentUserProvider.currentUserIdShouldReturn(userId);

		await remover.remove("event-storm-knit");

		wishlistRepository.expectRemoveToHaveBeenCalledWith(
			userId,
			new ProductId("event-storm-knit"),
		);
	});
});
