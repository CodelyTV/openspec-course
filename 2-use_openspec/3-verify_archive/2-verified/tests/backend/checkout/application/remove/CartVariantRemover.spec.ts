import { beforeEach, describe, expect, it } from "vitest";

import { CartVariantRemover } from "@/contexts/backend/checkout/application/remove/CartVariantRemover";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { EmptyStringValueObjectError } from "@/contexts/shared/domain/errors/EmptyStringValueObjectError";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { CheckoutLineMother } from "../../domain/CheckoutLineMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CartVariantRemover should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const remover = new CartVariantRemover(
		checkoutRepository,
		currentUserProvider,
	);
	const userId = new UserId("user-aibuilder");
	const lineToRemove = CheckoutLineMother.createPrimitives({
		variantId: "v1",
	});
	const lineToKeep = CheckoutLineMother.createPrimitives({
		variantId: "v2",
	});

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
	});

	it("remove the whole line of the variant from the current user's cart", async () => {
		const checkout = CheckoutMother.create({
			userId: userId.value,
			lines: [{ ...lineToRemove, quantity: 3 }, lineToKeep],
		});
		checkoutRepository.searchByUserShouldReturn(checkout);

		await remover.remove("v1");

		checkoutRepository.expectSearchByUserToHaveBeenCalledWith(userId);
		checkoutRepository.expectSaveToHaveBeenCalledWith(
			CheckoutMother.create({
				...checkout.toPrimitives(),
				lines: [lineToKeep],
			}),
		);
	});

	it("keep the cart lines unchanged when the variant is not in the cart", async () => {
		const checkout = CheckoutMother.create({
			userId: userId.value,
			lines: [lineToKeep],
		});
		checkoutRepository.searchByUserShouldReturn(checkout);

		await remover.remove("v1");

		checkoutRepository.expectSaveToHaveBeenCalledWith(checkout);
	});

	it("do nothing when the current user has no cart", async () => {
		checkoutRepository.searchByUserShouldReturn(null);

		await remover.remove("v1");

		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail and save nothing when the variant id is blank", async () => {
		checkoutRepository.searchByUserShouldReturn(
			CheckoutMother.create({ userId: userId.value }),
		);

		await expect(remover.remove("  ")).rejects.toBeInstanceOf(
			EmptyStringValueObjectError,
		);
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});
});
