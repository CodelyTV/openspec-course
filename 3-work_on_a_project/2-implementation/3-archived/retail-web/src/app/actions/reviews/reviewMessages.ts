import type { UserFacingMessages } from "../actionStateFor";

export const reviewMessages: UserFacingMessages = [
	[
		"ProductNotPurchasedError",
		"Only customers who bought this product can review it.",
	],
	["ReviewAlreadyExistsError", "You already reviewed this product."],
	["InvalidReviewRatingError", "The rating must be between 1 and 5 stars."],
	[
		"InvalidReviewTitleError",
		"The title must have between 1 and 100 characters.",
	],
	[
		"InvalidReviewBodyError",
		"The review must have between 1 and 2000 characters.",
	],
	["ReviewAlreadyModeratedError", "This review was already moderated."],
	["ReviewNotFoundError", "This review no longer exists."],
];
