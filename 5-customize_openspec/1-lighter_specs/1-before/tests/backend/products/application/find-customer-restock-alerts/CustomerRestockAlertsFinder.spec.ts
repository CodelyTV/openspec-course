import { beforeEach, describe, expect, it } from "vitest";

import { CustomerRestockAlertsFinder } from "@/contexts/backend/products/application/find-customer-restock-alerts/CustomerRestockAlertsFinder";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import type { RestockAlertRepository } from "@/contexts/backend/products/domain/RestockAlertRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("CustomerRestockAlertsFinder should", () => {
	const restockAlertRepository = Mock.create<RestockAlertRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const finder = new CustomerRestockAlertsFinder(
		restockAlertRepository,
		productRepository,
		currentUserProvider,
	);
	const currentCustomerId = new UserId("user-aibuilder");
	const jeans = ProductMother.create({
		id: "merge-conflict-jeans",
		variants: [
			ProductVariantMother.createPrimitives({
				id: "indigo-s",
				onlineStock: 0,
			}),
			ProductVariantMother.createPrimitives({
				id: "black-m",
				onlineStock: 0,
			}),
		],
	});

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(currentCustomerId);
		productRepository.searchShouldReturn(jeans);
	});

	it("return the variants of the product the current customer has an alert for", async () => {
		restockAlertRepository.searchVariantIdsOfShouldReturn([
			new VariantId("black-m"),
		]);

		expect(await finder.find("merge-conflict-jeans")).toEqual(["black-m"]);
		restockAlertRepository.expectSearchVariantIdsOfToHaveBeenCalledWith(
			currentCustomerId,
			[new VariantId("indigo-s"), new VariantId("black-m")],
		);
	});

	it("return no variants when the current customer has no alerts, even if another customer has", async () => {
		restockAlertRepository.searchVariantIdsOfShouldReturn([]);

		expect(await finder.find("merge-conflict-jeans")).toEqual([]);
		restockAlertRepository.expectSearchVariantIdsOfToHaveBeenCalledWith(
			currentCustomerId,
			[new VariantId("indigo-s"), new VariantId("black-m")],
		);
	});

	it("return no variants for a product that is not in the catalog", async () => {
		productRepository.searchShouldReturn(null);

		expect(await finder.find("ghost")).toEqual([]);
		restockAlertRepository.expectSearchVariantIdsOfNotToHaveBeenCalled();
	});
});
