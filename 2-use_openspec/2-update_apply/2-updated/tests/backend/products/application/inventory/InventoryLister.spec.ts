import { describe, expect, it } from "vitest";

import { InventoryLister } from "@/contexts/backend/products/application/inventory/InventoryLister";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("InventoryLister should", () => {
	const repository = Mock.create<ProductRepository>();
	const lister = new InventoryLister(repository);

	it("list every variant of every product flagging and counting those at or below the low stock threshold", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				name: "Tee",
				collection: "Core",
				variants: [
					ProductVariantMother.createPrimitives({
						color: "Black",
						size: "M",
						onlineStock: 2,
					}),
					ProductVariantMother.createPrimitives({
						color: "White",
						size: "L",
						onlineStock: 3,
					}),
				],
			}),
		]);

		expect(await lister.list()).toEqual({
			variants: [
				{
					productName: "Tee",
					collection: "Core",
					color: "Black",
					size: "M",
					stock: 2,
					low: true,
				},
				{
					productName: "Tee",
					collection: "Core",
					color: "White",
					size: "L",
					stock: 3,
					low: false,
				},
			],
			lowStockCount: 1,
		});
	});

	it("order the variants by stock, then product name, then size", async () => {
		repository.searchAllShouldReturn([
			ProductMother.create({
				name: "Beta",
				variants: [
					ProductVariantMother.createPrimitives({
						size: "S",
						onlineStock: 5,
					}),
					ProductVariantMother.createPrimitives({
						size: "M",
						onlineStock: 0,
					}),
				],
			}),
			ProductMother.create({
				name: "Alfa",
				variants: [
					ProductVariantMother.createPrimitives({
						size: "XL",
						onlineStock: 5,
					}),
					ProductVariantMother.createPrimitives({
						size: "XS",
						onlineStock: 5,
					}),
				],
			}),
		]);

		const { variants } = await lister.list();

		expect(variants.map((row) => `${row.productName} ${row.size}`)).toEqual(
			["Beta M", "Alfa XS", "Alfa XL", "Beta S"],
		);
	});

	it("return no rows when the catalog is empty", async () => {
		repository.searchAllShouldReturn([]);

		expect(await lister.list()).toEqual({ variants: [], lowStockCount: 0 });
	});
});
