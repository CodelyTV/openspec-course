import { describe, expect, it } from "vitest";

import { OutfitsLister } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { Product } from "@/contexts/backend/products/domain/Product";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

function inStock(id: string, name: string): Product {
	return ProductMother.create({
		id,
		name,
		variants: [ProductVariantMother.createPrimitives({ onlineStock: 3 })],
	});
}

function soldOut(id: string, name: string): Product {
	return ProductMother.create({
		id,
		name,
		variants: [
			ProductVariantMother.createPrimitives({
				size: "S",
				onlineStock: 0,
			}),
			ProductVariantMother.createPrimitives({
				size: "M",
				onlineStock: 0,
			}),
		],
	});
}

describe("OutfitsLister should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const lister = new OutfitsLister(outfitRepository, productRepository);

	it("return no outfits when there are none", async () => {
		outfitRepository.searchAllShouldReturn([]);
		productRepository.searchByIdsShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});

	it("list outfits ordered by name with their product count", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({
				id: "weekend",
				name: "Weekend Refactor",
				productIds: ["tee", "trousers", "jacket"],
			}),
			OutfitMother.create({
				id: "friday",
				name: "Deploy Friday",
				productIds: ["tee", "hoodie"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([
			inStock("tee", "Tee"),
			inStock("trousers", "Trousers"),
			inStock("jacket", "Jacket"),
			inStock("hoodie", "Hoodie"),
		]);

		expect(await lister.list()).toEqual([
			{
				id: "friday",
				name: "Deploy Friday",
				productCount: 2,
				outOfStockProductNames: [],
			},
			{
				id: "weekend",
				name: "Weekend Refactor",
				productCount: 3,
				outOfStockProductNames: [],
			},
		]);
	});

	it("name the only sold-out piece of an outfit", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "jacket"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([
			inStock("tee", "Tee"),
			soldOut("jacket", "Jacket"),
		]);

		const [summary] = await lister.list();

		expect(summary.outOfStockProductNames).toEqual(["Jacket"]);
	});

	it("name the sold-out pieces of an outfit in the order the admin set", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["hoodie", "tee", "trousers", "jacket"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([
			soldOut("hoodie", "Hoodie"),
			inStock("tee", "Tee"),
			soldOut("trousers", "Trousers"),
			inStock("jacket", "Jacket"),
		]);

		const [summary] = await lister.list();

		expect(summary.outOfStockProductNames).toEqual(["Hoodie", "Trousers"]);
	});

	it("show no warning for a piece sold out only in some variants", async () => {
		const partiallySoldOut = ProductMother.create({
			id: "tee",
			name: "Tee",
			variants: [
				ProductVariantMother.createPrimitives({
					size: "M",
					onlineStock: 0,
				}),
				ProductVariantMother.createPrimitives({
					size: "L",
					onlineStock: 2,
				}),
			],
		});
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "jacket"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([
			partiallySoldOut,
			inStock("jacket", "Jacket"),
		]);

		const [summary] = await lister.list();

		expect(partiallySoldOut.isOutOfStock()).toBe(false);
		expect(summary.outOfStockProductNames).toEqual([]);
	});
});
