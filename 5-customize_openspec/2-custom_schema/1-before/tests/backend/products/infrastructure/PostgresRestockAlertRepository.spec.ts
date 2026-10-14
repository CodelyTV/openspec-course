import { expect, it } from "vitest";

import { PostgresRestockAlertRepository } from "@/contexts/backend/products/infrastructure/PostgresRestockAlertRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../../users/domain/UserMother";
import { ProductMother } from "../domain/ProductMother";
import { ProductVariantMother } from "../domain/ProductVariantMother";
import { RestockAlertMother } from "../domain/RestockAlertMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresRestockAlertRepository(connection);

async function givenCustomers(...ids: string[]): Promise<void> {
	await arranger.givenUsers(...ids.map((id) => UserMother.create({ id })));
}

async function givenVariants(...ids: string[]): Promise<void> {
	await arranger.givenProducts(
		ProductMother.create({
			variants: ids.map((id) =>
				ProductVariantMother.createPrimitives({ id }),
			),
		}),
	);
}

function variantIds(...ids: string[]): VariantId[] {
	return ids.map((id) => new VariantId(id));
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresRestockAlertRepository should",
	() => {
		it("keep a single alert when a customer asks twice for the same variant", async () => {
			await givenCustomers("user-1");
			await givenVariants("moss-l");

			await repository.save(
				RestockAlertMother.create({
					userId: "user-1",
					variantId: "moss-l",
				}),
			);
			await repository.save(
				RestockAlertMother.create({
					userId: "user-1",
					variantId: "moss-l",
				}),
			);

			expect((await repository.countByVariant()).get("moss-l")).toBe(1);
		});

		it("search, among the given variants, those the customer has an alert for", async () => {
			await givenCustomers("user-1", "user-2");
			await givenVariants("moss-l", "black-m", "indigo-s");
			await repository.save(
				RestockAlertMother.create({
					userId: "user-1",
					variantId: "moss-l",
				}),
			);
			await repository.save(
				RestockAlertMother.create({
					userId: "user-1",
					variantId: "black-m",
				}),
			);
			await repository.save(
				RestockAlertMother.create({
					userId: "user-2",
					variantId: "indigo-s",
				}),
			);

			const alerted = await repository.searchVariantIdsOf(
				new UserId("user-1"),
				variantIds("moss-l", "indigo-s"),
			);

			expect(alerted).toEqual(variantIds("moss-l"));
		});

		it("find no alerted variants for a customer without alerts", async () => {
			await givenCustomers("user-1", "user-2");
			await givenVariants("moss-l");
			await repository.save(
				RestockAlertMother.create({
					userId: "user-2",
					variantId: "moss-l",
				}),
			);

			expect(
				await repository.searchVariantIdsOf(
					new UserId("user-1"),
					variantIds("moss-l"),
				),
			).toEqual([]);
		});

		it("count the customers waiting for each variant that has any", async () => {
			await givenCustomers("user-1", "user-2", "user-3");
			await givenVariants("moss-l", "black-m", "indigo-s");
			await repository.save(
				RestockAlertMother.create({
					userId: "user-1",
					variantId: "moss-l",
				}),
			);
			await repository.save(
				RestockAlertMother.create({
					userId: "user-2",
					variantId: "moss-l",
				}),
			);
			await repository.save(
				RestockAlertMother.create({
					userId: "user-3",
					variantId: "black-m",
				}),
			);

			const counts = await repository.countByVariant();

			expect(counts.get("moss-l")).toBe(2);
			expect(counts.get("black-m")).toBe(1);
			expect(counts.has("indigo-s")).toBe(false);
		});
	},
);
