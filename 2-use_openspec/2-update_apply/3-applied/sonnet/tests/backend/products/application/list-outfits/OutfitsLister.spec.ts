import { beforeEach, describe, expect, it } from "vitest";

import { OutfitsLister } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { Product } from "@/contexts/backend/products/domain/Product";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

describe("OutfitsLister should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const lister = new OutfitsLister(outfitRepository, productRepository);

	const withStock = (id: string, name: string): Product =>
		ProductMother.create({
			id,
			name,
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 3 }),
			],
		});
	const soldOut = (id: string, name: string): Product =>
		ProductMother.create({
			id,
			name,
			variants: [
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
				ProductVariantMother.createPrimitives({ onlineStock: 0 }),
			],
		});

	beforeEach(() => {
		outfitRepository.searchAllShouldReturn([]);
		productRepository.searchByIdsShouldReturn([]);
	});

	it("return no outfits when there are none", async () => {
		expect(await lister.list()).toEqual([]);
	});

	it("list the outfits ordered by name with their number of products", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({
				id: "weekend",
				name: "Weekend Refactor",
				productIds: ["tee", "jeans", "hoodie", "cap"],
			}),
			OutfitMother.create({
				id: "deploy",
				name: "Deploy Friday",
				productIds: ["tee", "jeans"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([
			withStock("tee", "Tee"),
			withStock("jeans", "Jeans"),
			withStock("hoodie", "Hoodie"),
			withStock("cap", "Cap"),
		]);

		expect(await lister.list()).toEqual([
			{
				id: "deploy",
				name: "Deploy Friday",
				productCount: 2,
				outOfStockProductNames: [],
			},
			{
				id: "weekend",
				name: "Weekend Refactor",
				productCount: 4,
				outOfStockProductNames: [],
			},
		]);
	});

	it("name the product with no stock in any variant", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({ productIds: ["tee", "jeans"] }),
		]);
		productRepository.searchByIdsShouldReturn([
			withStock("jeans", "Jeans"),
			soldOut("tee", "Pure Function Tee"),
		]);

		const [outfit] = await lister.list();

		expect(outfit.outOfStockProductNames).toEqual(["Pure Function Tee"]);
	});

	it("name every sold-out product in the order of the outfit", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({ productIds: ["jeans", "tee", "hoodie"] }),
		]);
		productRepository.searchByIdsShouldReturn([
			soldOut("tee", "Tee"),
			withStock("hoodie", "Hoodie"),
			soldOut("jeans", "Jeans"),
		]);

		const [outfit] = await lister.list();

		expect(outfit.outOfStockProductNames).toEqual(["Jeans", "Tee"]);
	});

	it("not warn about a product sold out only in some variants", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({ productIds: ["tee", "jeans"] }),
		]);
		productRepository.searchByIdsShouldReturn([
			ProductMother.create({
				id: "tee",
				variants: [
					ProductVariantMother.createPrimitives({
						size: "M",
						onlineStock: 0,
					}),
					ProductVariantMother.createPrimitives({
						size: "L",
						onlineStock: 5,
					}),
				],
			}),
			withStock("jeans", "Jeans"),
		]);

		const [outfit] = await lister.list();

		expect(outfit.outOfStockProductNames).toEqual([]);
	});
});
