import { expect, it } from "vitest";

import { OutfitNameAlreadyExistsError } from "@/contexts/backend/outfits/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitId } from "@/contexts/backend/outfits/domain/OutfitId";
import { OutfitName } from "@/contexts/backend/outfits/domain/OutfitName";
import { PostgresOutfitRepository } from "@/contexts/backend/outfits/infrastructure/PostgresOutfitRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { OutfitMother } from "../domain/OutfitMother";

const connection = new PostgresConnection();
const repository = new PostgresOutfitRepository(connection);
describeWithEnvironmentArranger(
	new RetailEnvironmentArranger(connection),
	"PostgresOutfitRepository should",
	() => {
		it("save and read ordered pieces without requiring catalog rows", async () => {
			const outfit = OutfitMother.create({ productIds: ["z", "a", "m"] });
			await repository.save(outfit);
			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
		});
		it("replace pieces on re-save", async () => {
			const outfit = OutfitMother.create();
			await repository.save(outfit);
			const updated = OutfitMother.create({
				...outfit.toPrimitives(),
				productIds: ["new-b", "new-a"],
			});
			await repository.save(updated);
			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(updated.toPrimitives());
		});
		it("find all pieces of outfits containing a product and list all outfits", async () => {
			const first = OutfitMother.create({
				name: "A",
				productIds: ["shared", "other"],
			});
			const second = OutfitMother.create({ name: "B" });
			await repository.save(second);
			await repository.save(first);
			expect(
				(
					await repository.searchContaining(new ProductId("shared"))
				).map((outfit) => outfit.toPrimitives()),
			).toEqual([first.toPrimitives()]);
			expect(
				(await repository.searchAll()).map((outfit) => outfit.id.value),
			).toEqual([first.id.value, second.id.value]);
		});
		it("return null for missing ids and normalized names", async () => {
			expect(await repository.search(new OutfitId("missing"))).toBeNull();
			expect(
				await repository.searchByName(new OutfitName("missing")),
			).toBeNull();
		});
		it("look up names ignoring case and surrounding spaces", async () => {
			const outfit = OutfitMother.create({ name: " Office LOOK " });
			await repository.save(outfit);
			expect(
				(
					await repository.searchByName(new OutfitName("office look"))
				)?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
		});
		it.each(["Office look", "office LOOK", " Office look "])(
			"reject duplicate creation for %s without saving pieces",
			async (name) => {
				const original = OutfitMother.create({ name: "Office look" });
				await repository.save(original);
				const duplicate = OutfitMother.create({ name });
				await expect(repository.save(duplicate)).rejects.toBeInstanceOf(
					OutfitNameAlreadyExistsError,
				);
				expect(await repository.search(duplicate.id)).toBeNull();
				expect(
					(await repository.search(original.id))?.toPrimitives(),
				).toEqual(original.toPrimitives());
			},
		);
		it.each(["Office look", "office LOOK", " Office look "])(
			"roll back duplicate renaming to %s and preserve pieces",
			async (name) => {
				const original = OutfitMother.create({ name: "Office look" });
				const other = OutfitMother.create({ name: "Weekend" });
				await repository.save(original);
				await repository.save(other);
				await expect(
					repository.save(
						OutfitMother.create({
							...other.toPrimitives(),
							name,
							productIds: ["replacement", "another"],
						}),
					),
				).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
				expect(
					(await repository.search(other.id))?.toPrimitives(),
				).toEqual(other.toPrimitives());
			},
		);
		it("release names and cascade pieces after deletion", async () => {
			const outfit = OutfitMother.create({ name: "Office look" });
			await repository.save(outfit);
			await repository.delete(outfit.id);
			expect(await repository.search(outfit.id)).toBeNull();
			expect(
				await repository.searchContaining(
					new ProductId(outfit.toPrimitives().productIds[0]),
				),
			).toEqual([]);
			const replacement = OutfitMother.create({ name: " office LOOK " });
			await repository.save(replacement);
			expect(
				(await repository.searchAll()).map((outfit) =>
					outfit.toPrimitives(),
				),
			).toEqual([replacement.toPrimitives()]);
		});
		it("allow exactly one concurrent duplicate save", async () => {
			const first = OutfitMother.create({ name: "Office look" });
			const second = OutfitMother.create({ name: " office LOOK " });
			const results = await Promise.allSettled([
				repository.save(first),
				repository.save(second),
			]);
			expect(
				results.filter((result) => result.status === "fulfilled"),
			).toHaveLength(1);
			const failure = results.find(
				(result) => result.status === "rejected",
			);
			expect(
				failure?.status === "rejected" && failure.reason,
			).toBeInstanceOf(OutfitNameAlreadyExistsError);
			const saved = await repository.searchAll();
			expect(saved).toHaveLength(1);
			expect([
				first.toPrimitives(),
				second.toPrimitives(),
			]).toContainEqual(saved[0].toPrimitives());
		});
	},
);
