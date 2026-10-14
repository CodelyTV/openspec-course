import { beforeEach, describe, expect, it } from "vitest";

import { CartItemCounter } from "@/contexts/backend/checkout/application/count/CartItemCounter";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { CheckoutLineMother } from "../../domain/CheckoutLineMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CartItemCounter should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const counter = new CartItemCounter(
		checkoutRepository,
		currentUserProvider,
	);
	const userId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
	});

	it("count every unit across the lines of the current user's cart", async () => {
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({
				userId: userId.value,
				lines: [
					CheckoutLineMother.createPrimitives({ quantity: 2 }),
					CheckoutLineMother.createPrimitives({ quantity: 3 }),
				],
			}),
		);

		expect(await counter.count()).toBe(5);
		checkoutRepository.expectSearchByUserToHaveBeenCalledWith(userId);
	});

	it("count zero when the cart has no lines", async () => {
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({ userId: userId.value, lines: [] }),
		);

		expect(await counter.count()).toBe(0);
	});

	it("count zero when the current user has no cart", async () => {
		checkoutRepository.searchByUserShouldReturn(null);

		expect(await counter.count()).toBe(0);
	});
});
