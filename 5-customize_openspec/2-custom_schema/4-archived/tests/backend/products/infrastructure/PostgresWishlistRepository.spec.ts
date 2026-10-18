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

async function wishlistItemsOf(userId: string): Promise<number> {
	const [{ count }] = await connection.sql<Array<{ count: number }>>`
		select count(*)::integer as count from wishlist_items where user_id = ${userId}
	`;

	return count;
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresWishlistRepository should",
	() => {
		it("keep a single item when a customer saves the same product twice", async () => {
			await givenCustomers("user-1");
			await givenProducts("hexagonal-overshirt");

			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "hexagonal-overshirt",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "hexagonal-overshirt",
				}),
			);

			expect(await wishlistItemsOf("user-1")).toBe(1);
		});

		it("remove nothing when the product is not in the wishlist", async () => {
			await givenCustomers("user-1");
			await givenProducts("hexagonal-overshirt", "event-storm-knit");
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "event-storm-knit",
				}),
			);

			await repository.remove(
				new UserId("user-1"),
				new ProductId("hexagonal-overshirt"),
			);

			expect(
				await repository.has(
					new UserId("user-1"),
					new ProductId("event-storm-knit"),
				),
			).toBe(true);
		});

		it("tell whether a customer has a product, per customer", async () => {
			await givenCustomers("user-1", "user-2");
			await givenProducts("event-storm-knit");
			await repository.save(
				WishlistItemMother.create({
					userId: "user-2",
					productId: "event-storm-knit",
				}),
			);

			expect(
				await repository.has(
					new UserId("user-2"),
					new ProductId("event-storm-knit"),
				),
			).toBe(true);
			expect(
				await repository.has(
					new UserId("user-1"),
					new ProductId("event-storm-knit"),
				),
			).toBe(false);
		});

		it("search only the customer's product ids, most recently saved first", async () => {
			await givenCustomers("user-1", "user-2");
			await givenProducts(
				"hexagonal-overshirt",
				"event-storm-knit",
				"domain-event-tee",
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "hexagonal-overshirt",
					savedAt: "2026-10-10T10:00:00.000Z",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "event-storm-knit",
					savedAt: "2026-10-12T10:00:00.000Z",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-2",
					productId: "domain-event-tee",
				}),
			);

			expect(
				await repository.searchProductIdsOf(new UserId("user-1")),
			).toEqual([
				new ProductId("event-storm-knit"),
				new ProductId("hexagonal-overshirt"),
			]);
		});

		it("count the customers who saved each product", async () => {
			await givenCustomers("user-1", "user-2", "user-3");
			await givenProducts(
				"hexagonal-overshirt",
				"event-storm-knit",
				"domain-event-tee",
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-1",
					productId: "hexagonal-overshirt",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-2",
					productId: "hexagonal-overshirt",
				}),
			);
			await repository.save(
				WishlistItemMother.create({
					userId: "user-3",
					productId: "event-storm-knit",
				}),
			);

			const counts = await repository.countByProduct();

			expect(counts.get("hexagonal-overshirt")).toBe(2);
			expect(counts.get("event-storm-knit")).toBe(1);
			expect(counts.has("domain-event-tee")).toBe(false);
		});
	},
);
