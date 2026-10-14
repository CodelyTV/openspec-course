import { beforeEach, describe, expect, it } from "vitest";

import { RestockAlertRequester } from "@/contexts/backend/products/application/request-restock-alert/RestockAlertRequester";
import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { RestockAlertRepository } from "@/contexts/backend/products/domain/RestockAlertRepository";
import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";
import { RestockAlertMother } from "../../domain/RestockAlertMother";

describe("RestockAlertRequester should", () => {
	const restockAlertRepository = Mock.create<RestockAlertRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const clock = Mock.create<Clock>();
	const requester = new RestockAlertRequester(
		restockAlertRepository,
		productRepository,
		currentUserProvider,
		clock,
	);
	const userId = new UserId("user-aibuilder");
	const now = new Date("2026-10-13T09:30:00.000Z");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
		clock.nowShouldReturn(now);
	});

	it("save an alert of the current customer for the variant, at the current time", async () => {
		productRepository.searchByVariantIdShouldReturn(
			ProductMother.create({
				variants: [
					ProductVariantMother.createPrimitives({
						id: "moss-l",
						onlineStock: 0,
					}),
				],
			}),
		);

		await requester.request("moss-l");

		productRepository.expectSearchByVariantIdToHaveBeenCalledWith(
			new VariantId("moss-l"),
		);
		restockAlertRepository.expectSaveToHaveBeenCalledWith(
			RestockAlertMother.create({
				userId: userId.value,
				variantId: "moss-l",
				requestedAt: now.toISOString(),
			}),
		);
	});

	it("reject a variant that is not in the catalog and save nothing", async () => {
		productRepository.searchByVariantIdShouldReturn(null);

		await expect(requester.request("ghost")).rejects.toBeInstanceOf(
			VariantNotFoundError,
		);
		restockAlertRepository.expectSaveNotToHaveBeenCalled();
	});
});
