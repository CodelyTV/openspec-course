import { beforeEach, expect, it } from "vitest";

import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";
import { ReviewAlreadyModeratedError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyModeratedError";
import { ReviewId } from "@/contexts/backend/reviews/domain/ReviewId";
import { PostgresReviewRepository } from "@/contexts/backend/reviews/infrastructure/PostgresReviewRepository";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { describeWithEnvironmentArranger } from "../../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../../users/domain/UserMother";
import { ReviewMother } from "../domain/ReviewMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const repository = new PostgresReviewRepository(connection);

const ada = UserMother.create({ id: "user-ada" });
const grace = UserMother.create({ id: "user-grace" });
const linus = UserMother.create({ id: "user-linus" });

describeWithEnvironmentArranger(
	arranger,
	"PostgresReviewRepository should",
	() => {
		beforeEach(async () => {
			await arranger.givenUsers(ada, grace, linus);
		});

		it("save a pending review and find it by its id", async () => {
			const review = ReviewMother.pending({ authorId: ada.id.value });

			await repository.save(review);

			expect(
				(await repository.search(review.id))?.toPrimitives(),
			).toEqual(review.toPrimitives());
		});

		it("find nothing for an unknown review id", async () => {
			expect(await repository.search(new ReviewId("ghost"))).toBeNull();
		});

		it("search the review of an author for a product", async () => {
			const review = ReviewMother.pending({
				productId: "hoodie",
				authorId: ada.id.value,
			});
			await repository.save(review);
			await repository.save(
				ReviewMother.pending({
					productId: "hoodie",
					authorId: grace.id.value,
				}),
			);
			await repository.save(
				ReviewMother.pending({
					productId: "tee",
					authorId: ada.id.value,
				}),
			);

			expect(
				(
					await repository.searchByProductAndAuthor(
						new ProductId("hoodie"),
						ada.id,
					)
				)?.toPrimitives(),
			).toEqual(review.toPrimitives());
			expect(
				await repository.searchByProductAndAuthor(
					new ProductId("jacket"),
					ada.id,
				),
			).toBeNull();
		});

		it("search only the approved reviews of a product, newest first", async () => {
			const older = ReviewMother.pending({
				productId: "hoodie",
				authorId: ada.id.value,
				createdAt: "2026-10-01T10:00:00.000Z",
			});
			const newer = ReviewMother.pending({
				productId: "hoodie",
				authorId: grace.id.value,
				createdAt: "2026-10-05T10:00:00.000Z",
			});
			const rejected = ReviewMother.pending({
				productId: "hoodie",
				authorId: linus.id.value,
			});
			await Promise.all(
				[older, newer, rejected].map((review) =>
					repository.save(review),
				),
			);
			await repository.save(older.approve());
			await repository.save(newer.approve());
			await repository.save(rejected.reject());
			await repository.save(
				ReviewMother.pending({
					productId: "tee",
					authorId: ada.id.value,
				}),
			);

			const approved = await repository.searchApprovedByProduct(
				new ProductId("hoodie"),
			);

			expect(approved.map((review) => review.toPrimitives())).toEqual([
				newer.approve().toPrimitives(),
				older.approve().toPrimitives(),
			]);
		});

		it("search only the pending reviews, oldest first", async () => {
			const newer = ReviewMother.pending({
				authorId: ada.id.value,
				createdAt: "2026-10-03T10:00:00.000Z",
			});
			const older = ReviewMother.pending({
				authorId: grace.id.value,
				createdAt: "2026-10-01T10:00:00.000Z",
			});
			const approved = ReviewMother.pending({ authorId: linus.id.value });
			await Promise.all(
				[newer, older, approved].map((review) =>
					repository.save(review),
				),
			);
			await repository.save(approved.approve());

			const pending = await repository.searchPending();

			expect(pending.map((review) => review.id)).toEqual([
				older.id,
				newer.id,
			]);
		});

		it("reject a second review of the same product by the same author", async () => {
			await repository.save(
				ReviewMother.pending({
					productId: "hoodie",
					authorId: ada.id.value,
				}),
			);

			await expect(
				repository.save(
					ReviewMother.pending({
						productId: "hoodie",
						authorId: ada.id.value,
					}),
				),
			).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
		});

		it("not moderate a review that is no longer pending, keeping its status", async () => {
			const review = ReviewMother.pending({ authorId: ada.id.value });
			await repository.save(review);
			await repository.save(review.approve());

			await expect(
				repository.save(review.reject()),
			).rejects.toBeInstanceOf(ReviewAlreadyModeratedError);
			expect((await repository.search(review.id))?.status).toBe(
				"approved",
			);
		});

		it("not moderate a review that was never saved", async () => {
			const review = ReviewMother.pending({ authorId: ada.id.value });

			await expect(
				repository.save(review.approve()),
			).rejects.toBeInstanceOf(ReviewAlreadyModeratedError);
		});
	},
);
