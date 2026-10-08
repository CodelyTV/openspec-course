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

describeWithEnvironmentArranger(arranger, "PostgresOutfitRepository", () => {
	it("saves, updates, searches in order, counts memberships and deletes", async () => {
		const a = ProductMother.create({ id: "a" });
		const b = ProductMother.create({ id: "b" });
		const c = ProductMother.create({ id: "c" });
		const d = ProductMother.create({ id: "d" });
		await arranger.givenProducts(a, b, c, d);
		const first = OutfitMother.create({
			id: "one",
			name: "Alpha",
			productIds: ["b", "a"],
		});
		const second = Outfit.fromPrimitives({
			id: "two",
			name: "Beta",
			productIds: ["a", "c"],
		});
		await repository.save(first);
		await repository.save(second);
		expect(
			(await repository.search(new OutfitId("one")))?.toPrimitives(),
		).toEqual(first.toPrimitives());
		expect((await repository.searchByName("Beta"))?.id.value).toBe("two");
		expect(
			(await repository.searchContaining(new ProductId("a"))).map(
				(outfit) => outfit.name,
			),
		).toEqual(["Alpha", "Beta"]);
		expect(
			(await repository.searchAll()).map((outfit) => outfit.id.value),
		).toEqual(["one", "two"]);
		const counts = await repository.countOutfitsByProduct();
		expect([
			counts.get("a"),
			counts.get("b"),
			counts.get("c"),
			counts.get("d"),
		]).toEqual([2, 1, 1, undefined]);
		const updated = Outfit.fromPrimitives({
			id: "one",
			name: "Alpha",
			productIds: ["d", "b"],
		});
		await repository.save(updated);
		expect(
			(await repository.search(new OutfitId("one")))?.toPrimitives(),
		).toEqual(updated.toPrimitives());
		await repository.delete(new OutfitId("two"));
		expect(await repository.search(new OutfitId("two"))).toBeNull();
		await connection.sql`delete from products where id = 'b'`;
		expect(
			(await repository.search(new OutfitId("one")))?.productIds.map(
				(id) => id.value,
			),
		).toEqual(["d"]);
	});

	it("maps duplicate outfit names to the domain error", async () => {
		const products = [
			ProductMother.create({ id: "p1" }),
			ProductMother.create({ id: "p2" }),
			ProductMother.create({ id: "p3" }),
		];
		await arranger.givenProducts(...products);
		await repository.save(
			OutfitMother.create({
				id: "first",
				name: "Taken",
				productIds: ["p1", "p2"],
			}),
		);
		await expect(
			repository.save(
				OutfitMother.create({
					id: "second",
					name: "Taken",
					productIds: ["p2", "p3"],
				}),
			),
		).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
	});
});
