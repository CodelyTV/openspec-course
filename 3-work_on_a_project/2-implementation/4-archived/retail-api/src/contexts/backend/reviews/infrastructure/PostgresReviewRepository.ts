import postgres from "postgres";

import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { ReviewAlreadyExistsError } from "../domain/errors/ReviewAlreadyExistsError";
import { ReviewAlreadyModeratedError } from "../domain/errors/ReviewAlreadyModeratedError";
import { Review } from "../domain/Review";
import type { ReviewId } from "../domain/ReviewId";
import type { ReviewRepository } from "../domain/ReviewRepository";
import { parseReviewStatus } from "../domain/ReviewStatus";

type ReviewRow = {
	id: string;
	product_id: string;
	user_id: string;
	product_name: string;
	rating: number;
	title: string;
	body: string;
	status: string;
	created_at: Date;
};

const uniqueViolationCode = "23505";
const oneReviewPerCustomerAndProductConstraint =
	"reviews_product_id_user_id_key";

function isProductAlreadyReviewedByTheAuthor(error: unknown): boolean {
	return (
		error instanceof postgres.PostgresError &&
		error.code === uniqueViolationCode &&
		error.constraint_name === oneReviewPerCustomerAndProductConstraint
	);
}

export class PostgresReviewRepository
	extends PostgresRepository
	implements ReviewRepository
{
	async save(review: Review): Promise<void> {
		if (review.isPending()) {
			await this.insert(review);

			return;
		}

		await this.moderate(review);
	}

	async search(id: ReviewId): Promise<Review | null> {
		const sql = this.sql;

		return (
			(await this.searchWhere(sql`id = ${id.value}`, sql`id`)).at(0) ??
			null
		);
	}

	async searchByProductAndAuthor(
		productId: ProductId,
		authorId: UserId,
	): Promise<Review | null> {
		const sql = this.sql;

		return (
			(
				await this.searchWhere(
					sql`product_id = ${productId.value} and user_id = ${authorId.value}`,
					sql`id`,
				)
			).at(0) ?? null
		);
	}

	async searchApprovedByProduct(productId: ProductId): Promise<Review[]> {
		const sql = this.sql;

		return this.searchWhere(
			sql`product_id = ${productId.value} and status = 'approved'`,
			sql`created_at desc, id`,
		);
	}

	async searchPending(): Promise<Review[]> {
		const sql = this.sql;

		return this.searchWhere(
			sql`status = 'pending'`,
			sql`created_at asc, id`,
		);
	}

	private async insert(review: Review): Promise<void> {
		const primitives = review.toPrimitives();

		try {
			await this.sql`
				insert into reviews (id, product_id, user_id, product_name, rating, title, body, status, created_at)
				values (
					${primitives.id},
					${primitives.productId},
					${primitives.authorId},
					${primitives.productName},
					${primitives.rating},
					${primitives.title},
					${primitives.body},
					${primitives.status},
					${review.createdAt}
				)
			`;
		} catch (error) {
			if (isProductAlreadyReviewedByTheAuthor(error)) {
				throw new ReviewAlreadyExistsError(primitives.productId);
			}

			throw error;
		}
	}

	private async moderate(review: Review): Promise<void> {
		const result = await this.sql`
			update reviews
			set status = ${review.status}
			where id = ${review.id.value} and status = 'pending'
		`;

		const noPendingReviewWasUpdated = result.count === 0;

		if (noPendingReviewWasUpdated) {
			throw new ReviewAlreadyModeratedError(review.id.value);
		}
	}

	private async searchWhere(
		condition: postgres.PendingQuery<postgres.Row[]>,
		order: postgres.PendingQuery<postgres.Row[]>,
	): Promise<Review[]> {
		const rows = await this.sql<ReviewRow[]>`
			select id, product_id, user_id, product_name, rating, title, body, status, created_at
			from reviews
			where ${condition}
			order by ${order}
		`;

		return rows.map((row) =>
			Review.fromPrimitives({
				id: row.id,
				productId: row.product_id,
				authorId: row.user_id,
				productName: row.product_name,
				rating: row.rating,
				title: row.title,
				body: row.body,
				status: parseReviewStatus(row.status),
				createdAt: row.created_at.toISOString(),
			}),
		);
	}
}
