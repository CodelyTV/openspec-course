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

async function givenCatalogProducts(...ids: string[]): Promise<void> {
	await arranger.givenProducts(
		...ids.map((id) => ProductMother.create({ id })),
	);
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresOutfitRepository should",
	() => {
		it("save an outfit keeping the order of its products", async () => {
			await givenCatalogProducts("tee", "chinos", "jacket");
			const outfit = OutfitMother.create({
				productIds: ["jacket", "tee", "chinos"],
			});

			await repository.save(outfit);

			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
		});

		it("update the name and replace the products of an existing outfit", async () => {
			await givenCatalogProducts("tee", "chinos", "jacket");
			const outfit = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "chinos"],
			});
			await repository.save(outfit);
			const edited = OutfitMother.create({
				id: outfit.id.value,
				name: "Weekend Refactor",
				productIds: ["jacket", "tee"],
			});

			await repository.save(edited);

			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(edited.toPrimitives());
		});

		it("find nothing for an unknown outfit id", async () => {
			expect(await repository.search(new OutfitId("ghost"))).toBeNull();
		});

		it("search an outfit by its exact name", async () => {
			await givenCatalogProducts("tee", "chinos");
			const outfit = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "chinos"],
			});
			await repository.save(outfit);

			expect(
				(
					await repository.searchByName("Deploy Friday")
				)?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
			expect(
				await repository.searchByName("Weekend Refactor"),
			).toBeNull();
		});

		it("reject a second outfit with a taken name", async () => {
			await givenCatalogProducts("tee", "chinos");
			await repository.save(
				OutfitMother.create({
					name: "Deploy Friday",
					productIds: ["tee", "chinos"],
				}),
			);

			await expect(
				repository.save(
					OutfitMother.create({
						name: "Deploy Friday",
						productIds: ["chinos", "tee"],
					}),
				),
			).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		});

		it("list every outfit ordered by name", async () => {
			await givenCatalogProducts("tee", "chinos");
			await repository.save(
				OutfitMother.create({
					name: "Weekend Refactor",
					productIds: ["tee", "chinos"],
				}),
			);
			await repository.save(
				OutfitMother.create({
					name: "Deploy Friday",
					productIds: ["chinos", "tee"],
				}),
			);

			expect(
				(await repository.searchAll()).map((outfit) => outfit.name),
			).toEqual(["Deploy Friday", "Weekend Refactor"]);
		});

		it("search the outfits containing a product, with all their products", async () => {
			await givenCatalogProducts("tee", "chinos", "jacket");
			const withTee = OutfitMother.create({
				productIds: ["chinos", "tee", "jacket"],
			});
			await repository.save(withTee);
			await repository.save(
				OutfitMother.create({ productIds: ["chinos", "jacket"] }),
			);

			const found = await repository.searchContaining(
				new ProductId("tee"),
			);

			expect(found.map((outfit) => outfit.toPrimitives())).toEqual([
				withTee.toPrimitives(),
			]);
		});

		it("count the outfits of each product that belongs to any", async () => {
			await givenCatalogProducts("in-two", "in-one", "in-none", "other");
			await repository.save(
				OutfitMother.create({ productIds: ["in-two", "in-one"] }),
			);
			await repository.save(
				OutfitMother.create({ productIds: ["other", "in-two"] }),
			);

			const counts = await repository.countOutfitsByProduct();

			expect(counts.get("in-two")).toBe(2);
			expect(counts.get("in-one")).toBe(1);
			expect(counts.has("in-none")).toBe(false);
		});

		it("delete an outfit without touching its products", async () => {
			await givenCatalogProducts("tee", "chinos");
			const outfit = OutfitMother.create({
				productIds: ["tee", "chinos"],
			});
			await repository.save(outfit);

			await repository.delete(outfit.id);

			expect(await repository.search(outfit.id)).toBeNull();
			expect((await repository.countOutfitsByProduct()).size).toBe(0);
		});

		it("drop a product removed from the catalog from its outfits, keeping the outfits", async () => {
			await givenCatalogProducts("tee", "chinos", "jacket");
			const trio = OutfitMother.create({
				productIds: ["tee", "chinos", "jacket"],
			});
			const pair = OutfitMother.create({ productIds: ["chinos", "tee"] });
			await repository.save(trio);
			await repository.save(pair);

			await arranger.removeProduct("tee");

			expect((await repository.search(trio.id))?.productIds).toEqual([
				new ProductId("chinos"),
				new ProductId("jacket"),
			]);
			expect((await repository.search(pair.id))?.productIds).toEqual([
				new ProductId("chinos"),
			]);
		});
	},
);
