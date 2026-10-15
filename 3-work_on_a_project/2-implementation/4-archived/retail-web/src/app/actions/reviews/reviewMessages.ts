import type { UserFacingMessages } from "../actionStateFor";

export const reviewMessages: UserFacingMessages = [
	["InvalidReviewRatingError", "Choose a rating between 1 and 5 stars."],
	[
		"InvalidReviewTitleError",
		"The title is required and can be at most 100 characters long.",
	],
	[
		"InvalidReviewBodyError",
		"The review text is required and can be at most 2000 characters long.",
	],
	[
		"ProductNotPurchasedError",
		"Only customers who bought this product can review it.",
	],
	["ReviewAlreadyExistsError", "You have already reviewed this product."],
	["ReviewedProductNotFoundError", "This product is no longer available."],
];

export const moderationMessages: UserFacingMessages = [
	["ReviewNotFoundError", "This review no longer exists."],
	[
		"ReviewAlreadyModeratedError",
		"This review was already moderated. Reload the page to see the current queue.",
	],
];
