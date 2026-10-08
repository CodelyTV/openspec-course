import { expect, it } from "vitest";

import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitErrors";
import { Outfit } from "@/contexts/backend/products/domain/Outfit";
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

describeWithEnvironmentArranger(
	arranger,
	"PostgresOutfitRepository should",
	() => {
		it("save, find, update, list, count and delete outfits while keeping product order", async () => {
			const products = ["a", "b", "c", "unused"].map((id) =>
				ProductMother.create({ id }),
			);
			await arranger.givenProducts(...products);
			const first = OutfitMother.create({
				id: "first",
				name: "Zulu",
				productIds: ["b", "a"],
			});
			const second = OutfitMother.create({
				id: "second",
				name: "Alpha",
				productIds: ["b", "c"],
			});
			expect(first.isDisplayable()).toBe(true);
			await repository.save(first);
			await repository.save(second);
			expect(
				(
					await repository.search(new OutfitId("first"))
				)?.toPrimitives(),
			).toEqual(first.toPrimitives());
			expect((await repository.searchByName("Alpha"))?.id.value).toBe(
				"second",
			);
			expect(
				(await repository.searchAll()).map((outfit) => outfit.name),
			).toEqual(["Alpha", "Zulu"]);
			expect(
				(await repository.searchContaining(new ProductId("b"))).map(
					(outfit) => outfit.id.value,
				),
			).toEqual(["second", "first"]);
			expect(await repository.countOutfitsByProduct()).toEqual(
				new Map([
					["a", 1],
					["b", 2],
					["c", 1],
				]),
			);
			const updated = Outfit.create(first.id, "Zulu", [
				new ProductId("c"),
				new ProductId("a"),
			]);
			await repository.save(updated);
			expect((await repository.search(first.id))?.toPrimitives()).toEqual(
				updated.toPrimitives(),
			);
			expect(
				(await repository.countOutfitsByProduct()).get("unused"),
			).toBeUndefined();
			await repository.delete(second.id);
			expect(await repository.search(second.id)).toBeNull();
			expect(await repository.searchByName("Alpha")).toBeNull();
		});

		it("cascade deleted products from outfits while keeping the outfit", async () => {
			await arranger.givenProducts(
				ProductMother.create({ id: "a" }),
				ProductMother.create({ id: "b" }),
			);
			await repository.save(
				OutfitMother.create({
					id: "outfit",
					name: "Look",
					productIds: ["a", "b"],
				}),
			);
			await connection.sql`delete from products where id = 'a'`;
			expect(
				(
					await repository.search(new OutfitId("outfit"))
				)?.productIds.map((id) => id.value),
			).toEqual(["b"]);
			expect(
				(
					await repository.search(new OutfitId("outfit"))
				)?.isDisplayable(),
			).toBe(false);
		});

		it("map a database name collision to a domain error", async () => {
			await arranger.givenProducts(
				ProductMother.create({ id: "a" }),
				ProductMother.create({ id: "b" }),
			);
			await repository.save(
				OutfitMother.create({
					id: "first",
					name: "Look",
					productIds: ["a", "b"],
				}),
			);
			await expect(
				repository.save(
					OutfitMother.create({
						id: "second",
						name: "Look",
						productIds: ["a", "b"],
					}),
				),
			).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		});
	},
);
