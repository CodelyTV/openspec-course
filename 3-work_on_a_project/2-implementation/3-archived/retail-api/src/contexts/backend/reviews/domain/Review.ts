import { parseLiteral } from "@/contexts/shared/domain/parseLiteral";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { ReviewAlreadyModeratedError } from "./errors/ReviewAlreadyModeratedError";
import { ReviewBody } from "./ReviewBody";
import { ReviewId } from "./ReviewId";
import { ReviewRating } from "./ReviewRating";
import { ReviewTitle } from "./ReviewTitle";

export const reviewStatuses = ["pending", "approved", "rejected"] as const;

export type ReviewStatus = (typeof reviewStatuses)[number];

export function parseReviewStatus(value: string): ReviewStatus {
	return parseLiteral("review status", reviewStatuses, value);
}

export type ReviewPrimitives = {
	id: string;
	productId: string;
	userId: string;
	productName: string;
	authorName: string;
	rating: number;
	title: string;
	body: string;
	status: ReviewStatus;
	createdAt: string;
};

export type ReviewSubmission = {
	productId: ProductId;
	userId: UserId;
	productName: string;
	authorName: string;
	rating: number;
	title: string;
	body: string;
};

export class Review {
	constructor(
		readonly id: ReviewId,
		readonly productId: ProductId,
		readonly userId: UserId,
		readonly productName: string,
		readonly authorName: string,
		readonly rating: number,
		readonly title: string,
		readonly body: string,
		readonly status: ReviewStatus,
		readonly createdAt: Date,
	) {}

	static submit(
		id: ReviewId,
		submission: ReviewSubmission,
		createdAt: Date,
	): Review {
		return new Review(
			id,
			submission.productId,
			submission.userId,
			submission.productName,
			submission.authorName,
			new ReviewRating(submission.rating).value,
			new ReviewTitle(submission.title).value,
			new ReviewBody(submission.body).value,
			"pending",
			createdAt,
		);
	}

	static fromPrimitives(primitives: ReviewPrimitives): Review {
		return new Review(
			new ReviewId(primitives.id),
			new ProductId(primitives.productId),
			new UserId(primitives.userId),
			primitives.productName,
			primitives.authorName,
			primitives.rating,
			primitives.title,
			primitives.body,
			primitives.status,
			new Date(primitives.createdAt),
		);
	}

	approve(): Review {
		return this.moderatedAs("approved");
	}

	reject(): Review {
		return this.moderatedAs("rejected");
	}

	isPending(): boolean {
		return this.status === "pending";
	}

	toPrimitives(): ReviewPrimitives {
		return {
			id: this.id.value,
			productId: this.productId.value,
			userId: this.userId.value,
			productName: this.productName,
			authorName: this.authorName,
			rating: this.rating,
			title: this.title,
			body: this.body,
			status: this.status,
			createdAt: this.createdAt.toISOString(),
		};
	}

	private moderatedAs(status: Exclude<ReviewStatus, "pending">): Review {
		if (!this.isPending()) {
			throw new ReviewAlreadyModeratedError(this.id.value, this.status);
		}

		return new Review(
			this.id,
			this.productId,
			this.userId,
			this.productName,
			this.authorName,
			this.rating,
			this.title,
			this.body,
			status,
			this.createdAt,
		);
	}
}
