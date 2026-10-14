import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { InvalidReviewBodyError } from "./errors/InvalidReviewBodyError";
import { InvalidReviewTitleError } from "./errors/InvalidReviewTitleError";
import { ReviewAlreadyModeratedError } from "./errors/ReviewAlreadyModeratedError";
import { ReviewId } from "./ReviewId";
import { ReviewRating } from "./ReviewRating";
import type { ReviewStatus } from "./ReviewStatus";

export const maxReviewTitleLength = 100;
export const maxReviewBodyLength = 2000;

export type ReviewPrimitives = {
	id: string;
	productId: string;
	authorId: string;
	productName: string;
	rating: number;
	title: string;
	body: string;
	status: ReviewStatus;
	createdAt: string;
};

function isNonBlankWithinLength(text: string, maxLength: number): boolean {
	return text.length > 0 && text.length <= maxLength;
}

export class Review {
	constructor(
		readonly id: ReviewId,
		readonly productId: ProductId,
		readonly authorId: UserId,
		readonly productName: string,
		readonly rating: ReviewRating,
		readonly title: string,
		readonly body: string,
		readonly status: ReviewStatus,
		readonly createdAt: Date,
	) {}

	static create(
		id: ReviewId,
		productId: ProductId,
		authorId: UserId,
		productName: string,
		rating: ReviewRating,
		title: string,
		body: string,
		createdAt: Date,
	): Review {
		const trimmedTitle = title.trim();
		const trimmedBody = body.trim();

		if (!isNonBlankWithinLength(trimmedTitle, maxReviewTitleLength)) {
			throw new InvalidReviewTitleError(maxReviewTitleLength);
		}

		if (!isNonBlankWithinLength(trimmedBody, maxReviewBodyLength)) {
			throw new InvalidReviewBodyError(maxReviewBodyLength);
		}

		return new Review(
			id,
			productId,
			authorId,
			productName,
			rating,
			trimmedTitle,
			trimmedBody,
			"pending",
			createdAt,
		);
	}

	static fromPrimitives(primitives: ReviewPrimitives): Review {
		return new Review(
			new ReviewId(primitives.id),
			new ProductId(primitives.productId),
			new UserId(primitives.authorId),
			primitives.productName,
			new ReviewRating(primitives.rating),
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
			authorId: this.authorId.value,
			productName: this.productName,
			rating: this.rating.value,
			title: this.title,
			body: this.body,
			status: this.status,
			createdAt: this.createdAt.toISOString(),
		};
	}

	private moderatedAs(status: Exclude<ReviewStatus, "pending">): Review {
		if (!this.isPending()) {
			throw new ReviewAlreadyModeratedError(this.id.value);
		}

		return new Review(
			this.id,
			this.productId,
			this.authorId,
			this.productName,
			this.rating,
			this.title,
			this.body,
			status,
			this.createdAt,
		);
	}
}
