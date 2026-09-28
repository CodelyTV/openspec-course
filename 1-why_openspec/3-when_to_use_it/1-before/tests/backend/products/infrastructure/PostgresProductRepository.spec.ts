import { expect, it } from "vitest";

import type { Product } from "@/contexts/backend/products/domain/Product";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import { VariantId } from "@/contexts/backend/products/domain/VariantId";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { ProductMother } from "../domain/ProductMother";
import { ProductVariantMother } from "../domain/ProductVariantMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresProductRepository(connection);

function idsOf(products: Product[]): string[] {
	return products.map((product) => product.id.value);
}

async function onlineStockOf(variantId: string): Promise<number | undefined> {
	const product = await repository.searchByVariantId(
		new VariantId(variantId),
	);

	return product?.variant(new VariantId(variantId))?.onlineStock;
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresProductRepository should",
	() => {
		it("find a product with its variants", async () => {
			const product = ProductMother.create({
				variants: [
					ProductVariantMother.createPrimitives({ size: "M" }),
				],
			});
			await arranger.givenProducts(product);

			const found = await repository.search(product.id);

			expect(found?.toPrimitives()).toEqual(product.toPrimitives());
		});

		it("find nothing for an unknown product id", async () => {
			await arranger.givenProducts(ProductMother.create());

			expect(await repository.search(new ProductId("ghost"))).toBeNull();
		});

		it("find the product that owns a variant", async () => {
			const product = ProductMother.create({
				variants: [
					ProductVariantMother.createPrimitives({ id: "v1" }),
					ProductVariantMother.createPrimitives({ id: "v2" }),
				],
			});
			await arranger.givenProducts(product, ProductMother.create());

			const found = await repository.searchByVariantId(
				new VariantId("v2"),
			);

			expect(found?.toPrimitives()).toEqual(product.toPrimitives());
		});

		it("find nothing for an unknown variant id", async () => {
			await arranger.givenProducts(ProductMother.create());

			expect(
				await repository.searchByVariantId(new VariantId("ghost")),
			).toBeNull();
		});

		it("list every product ordered by collection then name", async () => {
			await arranger.givenProducts(
				ProductMother.create({
					id: "zeta-beta",
					collection: "Zeta",
					name: "Beta",
				}),
				ProductMother.create({
					id: "core-beta",
					collection: "Core",
					name: "Beta",
				}),
				ProductMother.create({
					id: "core-alfa",
					collection: "Core",
					name: "Alfa",
				}),
			);

			expect(idsOf(await repository.searchAll())).toEqual([
				"core-alfa",
				"core-beta",
				"zeta-beta",
			]);
		});

		it("list each category once in alphabetical order", async () => {
			await arranger.givenProducts(
				ProductMother.create({ category: "Tees" }),
				ProductMother.create({ category: "Hoodies" }),
				ProductMother.create({ category: "Tees" }),
			);

			expect(await repository.searchCategories()).toEqual([
				"Hoodies",
				"Tees",
			]);
		});

		it("list each collection once in alphabetical order", async () => {
			await arranger.givenProducts(
				ProductMother.create({ collection: "Summer" }),
				ProductMother.create({ collection: "Core" }),
				ProductMother.create({ collection: "Summer" }),
			);

			expect(await repository.searchCollections()).toEqual([
				"Core",
				"Summer",
			]);
		});

		it("search only the products with the given ids", async () => {
			const wanted = ProductMother.create({ id: "wanted" });
			const alsoWanted = ProductMother.create({ id: "also-wanted" });
			await arranger.givenProducts(
				wanted,
				alsoWanted,
				ProductMother.create({ id: "not-wanted" }),
			);

			const found = await repository.searchByIds([
				wanted.id,
				alsoWanted.id,
			]);

			expect(idsOf(found).sort()).toEqual(["also-wanted", "wanted"]);
		});

		it("search products matching the collection and category criteria", async () => {
			await arranger.givenProducts(
				ProductMother.create({
					id: "wanted",
					collection: "Drop",
					category: "Tees",
				}),
				ProductMother.create({
					id: "other-category",
					collection: "Drop",
					category: "Hoodies",
				}),
				ProductMother.create({
					id: "other-collection",
					collection: "Core",
					category: "Tees",
				}),
			);

			expect(
				idsOf(
					await repository.searchMatching({
						collection: "Drop",
						category: "Tees",
					}),
				),
			).toEqual(["wanted"]);
			expect(
				idsOf(await repository.searchMatching({ collection: "Drop" })),
			).toHaveLength(2);
			expect(idsOf(await repository.searchMatching({}))).toHaveLength(3);
		});

		it("search related products, those of the same collection first and never the product itself", async () => {
			const product = ProductMother.create({
				id: "product",
				collection: "Drop",
			});
			await arranger.givenProducts(
				product,
				ProductMother.create({ id: "a-other", collection: "Another" }),
				ProductMother.create({
					id: "same-collection",
					collection: "Drop",
				}),
				ProductMother.create({ id: "z-other", collection: "Zeta" }),
			);

			const related = await repository.searchOthersSameCollectionFirst(
				product,
				2,
			);

			expect(idsOf(related)).toEqual(["same-collection", "a-other"]);
		});

		it("decrease the stock of a variant when enough units are left", async () => {
			await arranger.givenProducts(
				ProductMother.create({
					variants: [
						ProductVariantMother.createPrimitives({
							id: "v1",
							onlineStock: 3,
						}),
					],
				}),
			);

			const decreased = await repository.decreaseStockIfEnoughUnitsLeft(
				new VariantId("v1"),
				3,
			);

			expect(decreased).toBe(true);
			expect(await onlineStockOf("v1")).toBe(0);
		});

		it("leave the stock untouched when fewer units than requested are left", async () => {
			await arranger.givenProducts(
				ProductMother.create({
					variants: [
						ProductVariantMother.createPrimitives({
							id: "v1",
							onlineStock: 2,
						}),
					],
				}),
			);

			const decreased = await repository.decreaseStockIfEnoughUnitsLeft(
				new VariantId("v1"),
				3,
			);

			expect(decreased).toBe(false);
			expect(await onlineStockOf("v1")).toBe(2);
		});

		it("sell the last unit only once when two buyers race for it", async () => {
			await arranger.givenProducts(
				ProductMother.create({
					variants: [
						ProductVariantMother.createPrimitives({
							id: "v1",
							onlineStock: 1,
						}),
					],
				}),
			);

			const results = await Promise.all([
				repository.decreaseStockIfEnoughUnitsLeft(
					new VariantId("v1"),
					1,
				),
				repository.decreaseStockIfEnoughUnitsLeft(
					new VariantId("v1"),
					1,
				),
			]);

			expect(results.sort()).toEqual([false, true]);
			expect(await onlineStockOf("v1")).toBe(0);
		});
	},
);
