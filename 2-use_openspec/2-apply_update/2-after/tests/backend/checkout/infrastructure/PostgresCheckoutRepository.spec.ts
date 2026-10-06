import { assert, expect, it } from "vitest";

import { Checkout } from "@/contexts/backend/checkout/domain/Checkout";
import { CheckoutId } from "@/contexts/backend/checkout/domain/CheckoutId";
import { CheckoutConcurrentModificationError } from "@/contexts/backend/checkout/domain/errors/CheckoutConcurrentModificationError";
import { PostgresCheckoutRepository } from "@/contexts/backend/checkout/infrastructure/PostgresCheckoutRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { ProductMother } from "../../products/domain/ProductMother";
import { ProductVariantMother } from "../../products/domain/ProductVariantMother";
import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../../users/domain/UserMother";
import { CheckoutMother } from "../domain/CheckoutMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresCheckoutRepository(connection);

const user = UserMother.create();
const product = ProductMother.create({
	id: "p1",
	variants: [
		ProductVariantMother.createPrimitives({ id: "v1", size: "S" }),
		ProductVariantMother.createPrimitives({ id: "v2", size: "M" }),
	],
});

function newCheckoutWithOneUnitOfV1(): Checkout {
	return Checkout.create(
		new CheckoutId(CheckoutMother.createPrimitives().id),
		user.id,
	).addVariant("p1", new VariantId("v1"));
}

async function storedCheckout(): Promise<Checkout> {
	const checkout = await repository.searchByUser(user.id);

	assert.exists(checkout, `${user.id.value} has no stored checkout`);

	return checkout;
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresCheckoutRepository should",
	() => {
		it("save a new checkout and find it by its owner at its first version", async () => {
			await arranger.givenUsers(user);
			await arranger.givenProducts(product);
			const checkout = newCheckoutWithOneUnitOfV1();

			await repository.save(checkout);

			expect(
				(await repository.searchByUser(user.id))?.toPrimitives(),
			).toEqual({ ...checkout.toPrimitives(), version: 1 });
		});

		it("save changes to a checkout bumping its version", async () => {
			await arranger.givenUsers(user);
			await arranger.givenProducts(product);
			await repository.save(newCheckoutWithOneUnitOfV1());
			const stored = await storedCheckout();

			await repository.save(stored.addVariant("p1", new VariantId("v2")));

			const updated = await repository.searchByUser(user.id);
			expect(updated?.version).toBe(2);
			expect(updated?.itemCount()).toBe(2);
		});

		it("reject saving a checkout that changed since it was read", async () => {
			await arranger.givenUsers(user);
			await arranger.givenProducts(product);
			await repository.save(newCheckoutWithOneUnitOfV1());
			const readByFirstRequest = await storedCheckout();
			const readBySecondRequest = await storedCheckout();

			await repository.save(
				readByFirstRequest.addVariant("p1", new VariantId("v2")),
			);

			await expect(
				repository.save(readBySecondRequest.clear()),
			).rejects.toBeInstanceOf(CheckoutConcurrentModificationError);
			expect((await repository.searchByUser(user.id))?.itemCount()).toBe(
				2,
			);
		});

		it("reject creating a second checkout for the same user", async () => {
			await arranger.givenUsers(user);
			await arranger.givenProducts(product);
			await repository.save(newCheckoutWithOneUnitOfV1());

			await expect(
				repository.save(newCheckoutWithOneUnitOfV1()),
			).rejects.toBeInstanceOf(CheckoutConcurrentModificationError);
		});

		it("find nothing for a user without a checkout", async () => {
			await arranger.givenUsers(user);

			expect(await repository.searchByUser(user.id)).toBeNull();
		});
	},
);
