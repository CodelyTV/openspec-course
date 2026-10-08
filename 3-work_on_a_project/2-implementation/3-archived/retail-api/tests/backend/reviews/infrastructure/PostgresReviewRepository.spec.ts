import { expect, it } from "vitest";

import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";
import { ReviewId } from "@/contexts/backend/reviews/domain/ReviewId";
import { PostgresReviewRepository } from "@/contexts/backend/reviews/infrastructure/PostgresReviewRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../../users/domain/UserMother";
import { ReviewMother } from "../domain/ReviewMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresReviewRepository(connection);

async function givenCustomers(...ids: string[]): Promise<void> {
	await arranger.givenUsers(...ids.map((id) => UserMother.create({ id })));
}

describeWithEnvironmentArranger(
	arranger,
	"PostgresReviewRepository should",
	() => {
		it("save a review and search it by id", async () => {
			await givenCustomers("user-ana");
			const review = ReviewMother.pending({ userId: "user-ana" });

			await repository.save(review);

			expect(
				(await repository.search(review.id))?.toPrimitives(),
			).toEqual(review.toPrimitives());
		});

		it("update the status of a moderated review", async () => {
			await givenCustomers("user-ana");
			const review = ReviewMother.pending({ userId: "user-ana" });
			await repository.save(review);

			await repository.save(review.approve());

			expect((await repository.search(review.id))?.status).toBe(
				"approved",
			);
		});

		it("find nothing for an unknown review id", async () => {
			expect(await repository.search(new ReviewId("ghost"))).toBeNull();
		});

		it("search the review of a customer for a product", async () => {
			await givenCustomers("user-ana");
			const review = ReviewMother.rejected({
				userId: "user-ana",
				productId: "pure-function-tee",
			});
			await repository.save(review);

			expect(
				(
					await repository.searchByUserAndProduct(
						new UserId("user-ana"),
						new ProductId("pure-function-tee"),
					)
				)?.toPrimitives(),
			).toEqual(review.toPrimitives());
			expect(
				await repository.searchByUserAndProduct(
					new UserId("user-ana"),
					new ProductId("hexagonal-overshirt"),
				),
			).toBeNull();
		});

		it("search only the approved reviews of a product, newest first", async () => {
			await givenCustomers(
				"user-ana",
				"user-bob",
				"user-eva",
				"user-leo",
			);
			const twoDaysAgo = ReviewMother.approved({
				userId: "user-ana",
				productId: "pure-function-tee",
				createdAt: "2026-09-26T10:00:00.000Z",
			});
			const yesterday = ReviewMother.approved({
				userId: "user-bob",
				productId: "pure-function-tee",
				createdAt: "2026-09-27T10:00:00.000Z",
			});
			await repository.save(twoDaysAgo);
			await repository.save(yesterday);
			await repository.save(
				ReviewMother.pending({
					userId: "user-eva",
					productId: "pure-function-tee",
				}),
			);
			await repository.save(
				ReviewMother.rejected({
					userId: "user-leo",
					productId: "pure-function-tee",
				}),
			);
			await repository.save(
				ReviewMother.approved({
					userId: "user-ana",
					productId: "hexagonal-overshirt",
				}),
			);

			const found = await repository.searchApprovedByProduct(
				new ProductId("pure-function-tee"),
			);

			expect(found.map((review) => review.toPrimitives())).toEqual([
				yesterday.toPrimitives(),
				twoDaysAgo.toPrimitives(),
			]);
		});

		it("search the pending reviews of every product, oldest first", async () => {
			await givenCustomers("user-ana", "user-bob", "user-eva");
			const today = ReviewMother.pending({
				userId: "user-ana",
				createdAt: "2026-09-28T10:00:00.000Z",
			});
			const yesterday = ReviewMother.pending({
				userId: "user-bob",
				createdAt: "2026-09-27T10:00:00.000Z",
			});
			await repository.save(today);
			await repository.save(yesterday);
			await repository.save(
				ReviewMother.approved({ userId: "user-eva" }),
			);
			await repository.save(
				ReviewMother.rejected({ userId: "user-eva" }),
			);

			const found = await repository.searchPending();

			expect(found.map((review) => review.toPrimitives())).toEqual([
				yesterday.toPrimitives(),
				today.toPrimitives(),
			]);
		});

		it("reject a second review of the same product by the same customer", async () => {
			await givenCustomers("user-ana");
			await repository.save(
				ReviewMother.rejected({
					userId: "user-ana",
					productId: "pure-function-tee",
				}),
			);

			await expect(
				repository.save(
					ReviewMother.pending({
						userId: "user-ana",
						productId: "pure-function-tee",
					}),
				),
			).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
		});
	},
);
