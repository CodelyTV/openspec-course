import { describe, expect, it } from "vitest";

import { OutfitsLister } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";

describe("OutfitsLister", () => {
	it("reports sold-out piece names in outfit order and keeps outfits ordered", async () => {
		const outfits = Mock.create<OutfitRepository>();
		const products = Mock.create<ProductRepository>();
		outfits.searchAllShouldReturn([
			OutfitMother.create({
				id: "a",
				name: "Alpha",
				productIds: ["mixed", "sold-b", "sold-a"],
			}),
			OutfitMother.create({
				id: "b",
				name: "Beta",
				productIds: ["mixed"],
			}),
		]);
		products.searchByIdsShouldReturn([
			ProductMother.create({
				id: "mixed",
				name: "Mixed stock",
				variants: [
					{
						id: "m1",
						color: "Black",
						colorHex: "#000",
						size: "M",
						onlineStock: 0,
						measurements: { chest: 100, length: 70 },
					},
					{
						id: "m2",
						color: "White",
						colorHex: "#fff",
						size: "L",
						onlineStock: 2,
						measurements: { chest: 105, length: 72 },
					},
				],
			}),
			ProductMother.create({
				id: "sold-b",
				name: "Sold B",
				variants: [
					{
						id: "b",
						color: "Black",
						colorHex: "#000",
						size: "M",
						onlineStock: 0,
						measurements: { chest: 100, length: 70 },
					},
				],
			}),
			ProductMother.create({
				id: "sold-a",
				name: "Sold A",
				variants: [
					{
						id: "a",
						color: "Black",
						colorHex: "#000",
						size: "M",
						onlineStock: 0,
						measurements: { chest: 100, length: 70 },
					},
				],
			}),
		]);
		expect(await new OutfitsLister(outfits, products).list()).toEqual([
			{
				id: "a",
				name: "Alpha",
				productCount: 3,
				outOfStockProductNames: ["Sold B", "Sold A"],
			},
			{
				id: "b",
				name: "Beta",
				productCount: 1,
				outOfStockProductNames: [],
			},
		]);
	});
});
