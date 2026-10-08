import { expect, it } from "vitest";

import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import { PostgresOutfitRepository } from "@/contexts/backend/products/infrastructure/PostgresOutfitRepository";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { OutfitMother } from "../domain/OutfitMother";
import { ProductMother } from "../domain/ProductMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresOutfitRepository(connection);
const productRepository = new PostgresProductRepository(connection);

const tee = ProductMother.create({ id: "tee" });
const jeans = ProductMother.create({ id: "jeans" });
const hoodie = ProductMother.create({ id: "hoodie" });
const cap = ProductMother.create({ id: "cap" });

describeWithEnvironmentArranger(
	arranger,
	"PostgresOutfitRepository should",
	() => {
		it("save an outfit and read it back by id keeping the order of its products", async () => {
			await arranger.givenProducts(tee, jeans, hoodie);
			const outfit = OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["jeans", "tee", "hoodie"],
			});

			await repository.save(outfit);

			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
		});

		it("replace the name and the products of an already saved outfit", async () => {
			await arranger.givenProducts(tee, jeans, hoodie);
			const outfit = OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "jeans"],
			});
			await repository.save(outfit);
			const edited = OutfitMother.create({
				id: outfit.id.value,
				name: "Deploy Friday",
				productIds: ["hoodie", "tee"],
			});

			await repository.save(edited);

			expect(
				(await repository.search(outfit.id))?.toPrimitives(),
			).toEqual(edited.toPrimitives());
		});

		it("find nothing for an unknown outfit", async () => {
			expect(await repository.search(new OutfitId("ghost"))).toBeNull();
			expect(await repository.searchByName("Ghost")).toBeNull();
		});

		it("find an outfit by its name", async () => {
			await arranger.givenProducts(tee, jeans);
			const outfit = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["tee", "jeans"],
			});
			await repository.save(outfit);

			expect(
				(
					await repository.searchByName("Deploy Friday")
				)?.toPrimitives(),
			).toEqual(outfit.toPrimitives());
		});

		it("refuse two outfits with the same name", async () => {
			await arranger.givenProducts(tee, jeans);
			await repository.save(
				OutfitMother.create({
					name: "Deploy Friday",
					productIds: ["tee", "jeans"],
				}),
			);

			await expect(
				repository.save(
					OutfitMother.create({
						name: "Deploy Friday",
						productIds: ["jeans", "tee"],
					}),
				),
			).rejects.toBeInstanceOf(OutfitNameAlreadyExistsError);
		});

		it("list every outfit ordered by name", async () => {
			await arranger.givenProducts(tee, jeans);
			const weekend = OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "jeans"],
			});
			const deploy = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["jeans", "tee"],
			});
			await repository.save(weekend);
			await repository.save(deploy);

			expect(
				(await repository.searchAll()).map((outfit) =>
					outfit.toPrimitives(),
				),
			).toEqual([deploy.toPrimitives(), weekend.toPrimitives()]);
		});

		it("find the outfits containing a product ordered by name", async () => {
			await arranger.givenProducts(tee, jeans, hoodie);
			const weekend = OutfitMother.create({
				name: "Weekend Refactor",
				productIds: ["tee", "jeans"],
			});
			const deploy = OutfitMother.create({
				name: "Deploy Friday",
				productIds: ["hoodie", "tee"],
			});
			const other = OutfitMother.create({
				name: "Other",
				productIds: ["jeans", "hoodie"],
			});
			await repository.save(weekend);
			await repository.save(deploy);
			await repository.save(other);

			expect(
				(await repository.searchContaining(new ProductId("tee"))).map(
					(outfit) => outfit.name,
				),
			).toEqual(["Deploy Friday", "Weekend Refactor"]);
		});

		it("count the outfits of every product that belongs to some", async () => {
			await arranger.givenProducts(tee, jeans, hoodie, cap);
			await repository.save(
				OutfitMother.create({ productIds: ["tee", "jeans"] }),
			);
			await repository.save(
				OutfitMother.create({ productIds: ["tee", "hoodie"] }),
			);

			const counts = await repository.countOutfitsByProduct();

			expect(counts.get("tee")).toBe(2);
			expect(counts.get("jeans")).toBe(1);
			expect(counts.get("cap")).toBeUndefined();
		});

		it("delete an outfit leaving its products in the catalog", async () => {
			await arranger.givenProducts(tee, jeans);
			const outfit = OutfitMother.create({
				productIds: ["tee", "jeans"],
			});
			await repository.save(outfit);

			await repository.delete(outfit.id);

			expect(await repository.search(outfit.id)).toBeNull();
			expect(
				await productRepository.searchByIds([tee.id, jeans.id]),
			).toHaveLength(2);
		});

		it("keep the outfit without a product when that product is deleted from the catalog", async () => {
			await arranger.givenProducts(tee, jeans, hoodie);
			const outfit = OutfitMother.create({
				productIds: ["tee", "jeans", "hoodie"],
			});
			await repository.save(outfit);

			await connection.sql`delete from products where id = 'jeans'`;

			expect(
				(await repository.search(outfit.id))?.toPrimitives().productIds,
			).toEqual(["tee", "hoodie"]);
		});
	},
);
