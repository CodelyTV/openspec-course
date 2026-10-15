import { describe, expect, it } from "vitest";

import { actionStateFor } from "@/app/actions/actionStateFor";
import { InvalidFormDataError } from "@/app/actions/InvalidFormDataError";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

const invalidRequestMessage =
	"Something in the request was not valid. Reload the page and try again.";

function apiErrorOfType(type: string): RetailApiError {
	return new RetailApiError(409, type, "developer message");
}

describe("actionStateFor should", () => {
	it("show the user-facing message of a known API error type", () => {
		expect(actionStateFor(apiErrorOfType("EmptyCheckoutError"))).toEqual({
			error: "Your cart is empty. Add a product before confirming your order.",
		});
	});

	it.each(["InvalidArgumentError", "EmptyStringValueObjectError"])(
		"treat %s from the API as an invalid request",
		(type) => {
			expect(actionStateFor(apiErrorOfType(type))).toEqual({
				error: invalidRequestMessage,
			});
		},
	);

	it("treat invalid form data as an invalid request", () => {
		expect(
			actionStateFor(new InvalidFormDataError("variantId is required")),
		).toEqual({ error: invalidRequestMessage });
	});

	it("prefer the message of the action over the global one", () => {
		expect(
			actionStateFor(apiErrorOfType("VariantOutOfStockError"), [
				["VariantOutOfStockError", "Specific message"],
			]),
		).toEqual({ error: "Specific message" });
	});

	it("rethrow API errors of an unknown type", () => {
		const error = apiErrorOfType("InternalServerError");

		expect(() => actionStateFor(error)).toThrow(error);
	});

	it("rethrow errors that do not come from the API", () => {
		const error = new Error("fetch failed");

		expect(() => actionStateFor(error)).toThrow(error);
	});
});
