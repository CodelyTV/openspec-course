import { describe, expect, it } from "vitest";

import { OutfitsLister } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";
import type { Product } from "@/contexts/backend/products/domain/Product";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";
import { ProductMother } from "../../domain/ProductMother";
import { ProductVariantMother } from "../../domain/ProductVariantMother";

function productWithStock(
	id: string,
	name: string,
	stockPerVariant: number[],
): Product {
	return ProductMother.create({
		id,
		name,
		variants: stockPerVariant.map((onlineStock) =>
			ProductVariantMother.createPrimitives({ onlineStock }),
		),
	});
}

describe("OutfitsLister should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const lister = new OutfitsLister(outfitRepository, productRepository);

	it("list every outfit ordered by name with its number of products", async () => {
		const weekendRefactor = OutfitMother.create({
			name: "Weekend Refactor",
			productIds: ["tee", "chinos", "jacket", "vest"],
		});
		const deployFriday = OutfitMother.create({
			name: "Deploy Friday",
			productIds: ["tee", "chinos"],
		});
		outfitRepository.searchAllShouldReturn([weekendRefactor, deployFriday]);
		productRepository.searchByIdsShouldReturn([
			productWithStock("tee", "Tee", [3]),
			productWithStock("chinos", "Chinos", [3]),
			productWithStock("jacket", "Jacket", [3]),
			productWithStock("vest", "Vest", [3]),
		]);

		expect(await lister.list()).toEqual([
			{
				id: deployFriday.id.value,
				name: "Deploy Friday",
				productCount: 2,
				outOfStockProductNames: [],
			},
			{
				id: weekendRefactor.id.value,
				name: "Weekend Refactor",
				productCount: 4,
				outOfStockProductNames: [],
			},
		]);
	});

	it("name the piece that has no stock in any variant", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({ productIds: ["tee", "chinos"] }),
		]);
		productRepository.searchByIdsShouldReturn([
			productWithStock("tee", "Pure Function Tee", [0, 0]),
			productWithStock("chinos", "Chinos", [4]),
		]);

		const [outfit] = await lister.list();

		expect(outfit.outOfStockProductNames).toEqual(["Pure Function Tee"]);
	});

	it("name every sold-out piece in the order of the outfit", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({ productIds: ["jacket", "tee", "chinos"] }),
		]);
		productRepository.searchByIdsShouldReturn([
			productWithStock("chinos", "Chinos", [0]),
			productWithStock("tee", "Tee", [2]),
			productWithStock("jacket", "Jacket", [0, 0, 0]),
		]);

		const [outfit] = await lister.list();

		expect(outfit.outOfStockProductNames).toEqual(["Jacket", "Chinos"]);
	});

	it("not warn about a piece sold out only in some of its variants", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({ productIds: ["tee", "chinos"] }),
		]);
		productRepository.searchByIdsShouldReturn([
			productWithStock("tee", "Tee", [0, 5, 0]),
			productWithStock("chinos", "Chinos", [1]),
		]);

		const [outfit] = await lister.list();

		expect(outfit.outOfStockProductNames).toEqual([]);
	});

	it("keep the order by name whatever the warnings", async () => {
		outfitRepository.searchAllShouldReturn([
			OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["sold-out", "tee"],
			}),
			OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "chinos"],
			}),
		]);
		productRepository.searchByIdsShouldReturn([
			productWithStock("sold-out", "Sold Out", [0]),
			productWithStock("tee", "Tee", [3]),
			productWithStock("chinos", "Chinos", [3]),
		]);

		expect((await lister.list()).map((outfit) => outfit.name)).toEqual([
			"Deploy Friday",
			"Weekend Refactor",
		]);
	});

	it("list an outfit left with a single product", async () => {
		const leftWithOne = OutfitMother.withOnlyOneProductLeft({
			productId: "tee",
		});
		outfitRepository.searchAllShouldReturn([leftWithOne]);
		productRepository.searchByIdsShouldReturn([
			productWithStock("tee", "Tee", [3]),
		]);

		expect(await lister.list()).toEqual([
			{
				id: leftWithOne.id.value,
				name: leftWithOne.name,
				productCount: 1,
				outOfStockProductNames: [],
			},
		]);
	});

	it("return no outfits when there are none", async () => {
		outfitRepository.searchAllShouldReturn([]);
		productRepository.searchByIdsShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});
});
