import { expect, it } from "vitest";

import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import { PostgresOutfitRepository } from "@/contexts/backend/products/infrastructure/PostgresOutfitRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { OutfitMother } from "../domain/OutfitMother";
import { ProductMother } from "../domain/ProductMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresOutfitRepository(connection);

const tee = ProductMother.create({ id: "tee" });
const trousers = ProductMother.create({ id: "trousers" });
const jacket = ProductMother.create({ id: "jacket" });
const hoodie = ProductMother.create({ id: "hoodie" });
const shirt = ProductMother.create({ id: "shirt" });

async function givenCatalog(): Promise<void> {
	await arranger.givenProducts(tee, trousers, jacket, hoodie, shirt);
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresOutfitRepository should",
	() => {
		it("save an outfit and read it back with its products in the order given", async () => {
			await givenCatalog();
			const outfit = OutfitMother.create({
				id: "weekend-refactor",
				name: "Weekend Refactor",
				productIds: ["jacket", "tee", "trousers"],
			});

			await repository.save(outfit);
			const found = await repository.search(outfit.id);

			expect(found?.toPrimitives()).toEqual(outfit.toPrimitives());
		});

		it("update the name and products of an existing outfit", async () => {
			await givenCatalog();
			const outfit = OutfitMother.create({
				id: "deploy-friday",
				name: "Deploy Friday",
				productIds: ["tee", "hoodie"],
			});
			await repository.save(outfit);

			const updated = OutfitMother.create({
				id: "deploy-friday",
				name: "Friday Deploy",
				productIds: ["shirt", "trousers", "jacket"],
			});
			await repository.save(updated);

			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(updated.toPrimitives());
		});

		it("find nothing for an unknown outfit id", async () => {
			expect(await repository.search(new OutfitId("ghost"))).toBeNull();
		});

		it("find an outfit by its name", async () => {
			await givenCatalog();
			const outfit = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "hoodie"],
			});
			await repository.save(outfit);

			expect(
				(
					await repository.searchByName("Deploy Friday")
				)?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
			expect(await repository.searchByName("Unknown")).toBeNull();
		});

		it("list every saved outfit", async () => {
			await givenCatalog();
			const first = OutfitMother.create({
				productIds: ["tee", "hoodie"],
			});
			const second = OutfitMother.create({
				productIds: ["jacket", "shirt"],
			});
			await repository.save(first);
			await repository.save(second);

			const outfits = await repository.searchAll();

			expect(outfits.map((outfit) => outfit.toPrimitives())).toEqual(
				expect.arrayContaining([
					first.toPrimitives(),
					second.toPrimitives(),
				]),
			);
			expect(outfits).toHaveLength(2);
		});

		it("find the outfits that contain a product", async () => {
			await givenCatalog();
			const weekend = OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "trousers"],
			});
			const friday = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "hoodie"],
			});
			const other = OutfitMother.create({
				name: "Other",
				productIds: ["jacket", "shirt"],
			});
			await repository.save(weekend);
			await repository.save(friday);
			await repository.save(other);

			const outfits = await repository.searchContaining(
				new ProductId("tee"),
			);

			expect(outfits.map((outfit) => outfit.name).sort()).toEqual([
				"Deploy Friday",
				"Weekend Refactor",
			]);
		});

		it("count how many outfits each product belongs to", async () => {
			await givenCatalog();
			await repository.save(
				OutfitMother.create({ productIds: ["tee", "trousers"] }),
			);
			await repository.save(
				OutfitMother.create({ productIds: ["tee", "hoodie"] }),
			);

			const counts = await repository.countOutfitsByProduct();

			expect(counts.get("tee")).toBe(2);
			expect(counts.get("trousers")).toBe(1);
			expect(counts.get("jacket")).toBeUndefined();
		});

		it("reject a name already used by another outfit", async () => {
			await givenCatalog();
			await repository.save(
				OutfitMother.create({
					name: "Deploy Friday",
					productIds: ["tee", "hoodie"],
				}),
			);

			await expect(
				repository.save(
					OutfitMother.create({
						name: "Deploy Friday",
						productIds: ["jacket", "shirt"],
					}),
				),
			).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		});

		it("delete an outfit without deleting its products", async () => {
			await givenCatalog();
			const outfit = OutfitMother.create({
				id: "deploy-friday",
				productIds: ["tee", "hoodie"],
			});
			await repository.save(outfit);

			await repository.delete(outfit.id);

			expect(await repository.search(outfit.id)).toBeNull();
			expect(await repository.countOutfitsByProduct()).toEqual(new Map());
		});

		it("drop a product from its outfits when the product leaves the catalog", async () => {
			await givenCatalog();
			const outfit = OutfitMother.create({
				id: "weekend-refactor",
				productIds: ["tee", "trousers", "jacket"],
			});
			await repository.save(outfit);

			await arranger.givenProductRemovedFromCatalog("tee");

			const found = await repository.search(outfit.id);
			expect(found?.productIds.map((id) => id.value)).toEqual([
				"trousers",
				"jacket",
			]);
		});
	},
);
