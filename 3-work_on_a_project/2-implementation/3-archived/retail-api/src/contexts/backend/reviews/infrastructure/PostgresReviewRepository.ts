import postgres from "postgres";

import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { ReviewAlreadyExistsError } from "../domain/errors/ReviewAlreadyExistsError";
import { parseReviewStatus, Review } from "../domain/Review";
import type { ReviewId } from "../domain/ReviewId";
import type { ReviewRepository } from "../domain/ReviewRepository";

type ReviewRow = {
	id: string;
	product_id: string;
	user_id: string;
	product_name: string;
	author_name: string;
	rating: number;
	title: string;
	body: string;
	status: string;
	created_at: Date;
};

const uniqueViolationCode = "23505";
const oneReviewPerCustomerAndProductConstraint =
	"reviews_user_id_product_id_key";

function isProductAlreadyReviewedByTheCustomer(error: unknown): boolean {
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
		const primitives = review.toPrimitives();

		try {
			await this.sql`
				insert into reviews (id, product_id, user_id, product_name, author_name, rating, title, body, status, created_at)
				values (
					${primitives.id},
					${primitives.productId},
					${primitives.userId},
					${primitives.productName},
					${primitives.authorName},
					${primitives.rating},
					${primitives.title},
					${primitives.body},
					${primitives.status},
					${review.createdAt}
				)
				on conflict (id) do update set status = excluded.status
			`;
		} catch (error) {
			if (isProductAlreadyReviewedByTheCustomer(error)) {
				throw new ReviewAlreadyExistsError(primitives.productId);
			}

			throw error;
		}
	}

	async search(id: ReviewId): Promise<Review | null> {
		const sql = this.sql;

		return (await this.searchWhere(sql`id = ${id.value}`)).at(0) ?? null;
	}

	async searchByUserAndProduct(
		userId: UserId,
		productId: ProductId,
	): Promise<Review | null> {
		const sql = this.sql;

		return (
			(
				await this.searchWhere(
					sql`user_id = ${userId.value} and product_id = ${productId.value}`,
				)
			).at(0) ?? null
		);
	}

	async searchApprovedByProduct(productId: ProductId): Promise<Review[]> {
		const sql = this.sql;

		return this.searchWhere(
			sql`product_id = ${productId.value} and status = 'approved'`,
			sql`created_at desc`,
		);
	}

	async searchPending(): Promise<Review[]> {
		const sql = this.sql;

		return this.searchWhere(sql`status = 'pending'`, sql`created_at asc`);
	}

	private async searchWhere(
		condition: postgres.PendingQuery<postgres.Row[]>,
		order: postgres.PendingQuery<postgres.Row[]> = this
			.sql`created_at desc`,
	): Promise<Review[]> {
		const rows = await this.sql<ReviewRow[]>`
			select id, product_id, user_id, product_name, author_name, rating, title, body, status, created_at
			from reviews
			where ${condition}
			order by ${order}, id
		`;

		return rows.map((row) =>
			Review.fromPrimitives({
				id: row.id,
				productId: row.product_id,
				userId: row.user_id,
				productName: row.product_name,
				authorName: row.author_name,
				rating: row.rating,
				title: row.title,
				body: row.body,
				status: parseReviewStatus(row.status),
				createdAt: row.created_at.toISOString(),
			}),
		);
	}
}
