import { expect, it } from "vitest";

import { PostgresWishlistRepository } from "@/contexts/backend/products/infrastructure/PostgresWishlistRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../../users/domain/UserMother";
import { ProductMother } from "../domain/ProductMother";
import { WishlistItemMother } from "../domain/WishlistItemMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresWishlistRepository(connection);

async function givenCustomers(...ids: string[]): Promise<void> {
	await arranger.givenUsers(...ids.map((id) => UserMother.create({ id })));
}

async function givenProducts(...ids: string[]): Promise<void> {
	await arranger.givenProducts(
		...ids.map((id) => ProductMother.create({ id })),
	);
}

function productIds(...ids: string[]): ProductId[] {
	return ids.map((id) => new ProductId(id));
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresWishlistRepository should",
	() => {
		it("save a product once even when saved twice", async () => {
			await givenCustomers("user-1");
			await givenProducts("overshirt");

			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "overshirt",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "overshirt",
				}),
			);

			expect(
				await repository.searchProductIdsOf(new UserId("user-1")),
			).toEqual(productIds("overshirt"));
		});

		it("remove a product and ignore removing a missing one", async () => {
			await givenCustomers("user-1");
			await givenProducts("jeans");
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "jeans",
				}),
			);

			await repository.remove(
				new UserId("user-1"),
				new ProductId("jeans"),
			);
			await repository.remove(
				new UserId("user-1"),
				new ProductId("jeans"),
			);

			expect(
				await repository.contains(
					new UserId("user-1"),
					new ProductId("jeans"),
				),
			).toBe(false);
		});

		it("tell whether a customer saved a product, ignoring other customers", async () => {
			await givenCustomers("user-1", "user-2");
			await givenProducts("jeans", "tee");
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "jeans",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-2",
					productId: "tee",
				}),
			);

			expect(
				await repository.contains(
					new UserId("user-1"),
					new ProductId("jeans"),
				),
			).toBe(true);
			expect(
				await repository.contains(
					new UserId("user-1"),
					new ProductId("tee"),
				),
			).toBe(false);
		});

		it("return a customer's product ids most recently saved first, without other customers'", async () => {
			await givenCustomers("user-1", "user-2");
			await givenProducts("tee", "overshirt", "jeans");
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "tee",
					savedAt: "2026-10-01T10:00:00.000Z",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "overshirt",
					savedAt: "2026-10-02T10:00:00.000Z",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-2",
					productId: "jeans",
				}),
			);

			expect(
				await repository.searchProductIdsOf(new UserId("user-1")),
			).toEqual(productIds("overshirt", "tee"));
		});

		it("count customers per product", async () => {
			await givenCustomers("user-1", "user-2");
			await givenProducts("overshirt", "tee");
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "overshirt",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-2",
					productId: "overshirt",
				}),
			);

			const counts = await repository.countByProduct();

			expect(counts.get("overshirt")).toBe(2);
			expect(counts.has("tee")).toBe(false);
		});
	},
);
