import { expect, it } from "vitest";

import { OutfitCreator } from "@/contexts/backend/outfits/application/create/OutfitCreator";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/outfits/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "@/contexts/backend/outfits/domain/errors/OutfitProductNotFoundError";
import { OutfitId } from "@/contexts/backend/outfits/domain/OutfitId";
import { PostgresOutfitRepository } from "@/contexts/backend/outfits/infrastructure/PostgresOutfitRepository";
import { ProductsOutfitCatalog } from "@/contexts/backend/outfits/infrastructure/ProductsOutfitCatalog";
import { ProductsByIdsSearcher } from "@/contexts/backend/products/application/search-by-ids/ProductsByIdsSearcher";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Mock } from "../../shared/Mock";
import { OutfitMother } from "../outfits/domain/OutfitMother";
import { ProductMother } from "../products/domain/ProductMother";
import { describeWithEnvironmentArranger } from "../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../shared/infrastructure/RetailEnvironmentArranger";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresOutfitRepository(connection);
const ids = Mock.create<IdGenerator>();
const creator = new OutfitCreator(
	repository,
	ids,
	new ProductsOutfitCatalog(
		new ProductsByIdsSearcher(new PostgresProductRepository(connection)),
	),
);
describeWithEnvironmentArranger(arranger, "Outfit creation should", () => {
	it("save an outfit of real catalog products in order", async () => {
		const products = [ProductMother.create(), ProductMother.create()];
		await arranger.givenProducts(...products);
		const outfit = OutfitMother.create({
			productIds: products.map((product) => product.id.value),
		});
		ids.generateShouldReturn(outfit.id.value);
		await creator.create(
			outfit.name.value,
			outfit.toPrimitives().productIds,
		);
		expect((await repository.search(outfit.id))?.toPrimitives()).toEqual(
			outfit.toPrimitives(),
		);
	});
	it("reject an unknown product without persisting", async () => {
		const product = ProductMother.create();
		await arranger.givenProducts(product);
		ids.generateShouldReturn("missing-product-outfit");
		await expect(
			creator.create("Look", [product.id.value, "unknown"]),
		).rejects.toBeInstanceOf(OutfitProductNotFoundError);
		expect(await repository.searchAll()).toEqual([]);
	});
	it.each(["Office look", "office LOOK", " Office look "])(
		"reject duplicate name %s through the real wiring",
		async (name) => {
			const products = [ProductMother.create(), ProductMother.create()];
			await arranger.givenProducts(...products);
			const productIds = products.map((product) => product.id.value);
			ids.generateShouldReturn("original");
			await creator.create("Office look", productIds);
			ids.generateShouldReturn("duplicate");
			await expect(
				creator.create(name, [...productIds].reverse()),
			).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
			expect(
				await repository.search(new OutfitId("duplicate")),
			).toBeNull();
			expect(
				(await repository.searchAll()).map((outfit) =>
					outfit.toPrimitives(),
				),
			).toEqual([{ id: "original", name: "Office look", productIds }]);
		},
	);
});
