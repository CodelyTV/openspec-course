import { describe, expect, it } from "vitest";

import {
	formatDayAndMonth,
	formatDeliveryMethod,
	formatLongDate,
	formatMoney,
	formatMoneyPerCurrency,
	formatOptionalMoney,
	formatOutfitMembership,
	formatProductCount,
	formatReviewCount,
	formatShortDate,
	formatStarRating,
	formatStatus,
	formatUnits,
	variantLabel,
} from "@/contexts/frontend/retail/ui/format";

describe("format", () => {
	it("formats euro amounts without decimals", () => {
		expect(formatMoney({ amount: 89, currency: "EUR" })).toBe("€89");
	});

	it("rounds decimal amounts to whole euros", () => {
		expect(formatMoney({ amount: 89.49, currency: "EUR" })).toBe("€89");
	});

	it("formats amounts in the given currency", () => {
		expect(formatMoney({ amount: 89, currency: "USD" })).toBe("US$89");
	});

	it("shows a dash instead of an amount that does not exist", () => {
		expect(formatOptionalMoney(null)).toBe("—");
		expect(formatOptionalMoney({ amount: 89, currency: "EUR" })).toBe(
			"€89",
		);
	});

	it("formats one amount per currency, or a dash when there is none", () => {
		expect(
			formatMoneyPerCurrency([
				{ amount: 89, currency: "EUR" },
				{ amount: 20, currency: "USD" },
			]),
		).toBe("€89 · US$20");
		expect(formatMoneyPerCurrency([])).toBe("—");
	});

	it("translates known status and delivery codes", () => {
		expect(formatStatus("confirmed")).toBe("Confirmed");
		expect(formatDeliveryMethod("home-delivery")).toBe("Home delivery");
	});

	it("shows unknown status and delivery codes as they are", () => {
		expect(formatStatus("shipped")).toBe("shipped");
		expect(formatDeliveryMethod("drone")).toBe("drone");
	});

	it("builds the variant label from color and size", () => {
		expect(variantLabel("Black", "M")).toBe("Black / M");
	});

	it("formats dates in short, long and day-and-month forms", () => {
		const isoDate = "2026-03-14T10:00:00.000Z";

		expect(formatShortDate(isoDate)).toBe("14 Mar 2026");
		expect(formatLongDate(isoDate)).toBe("14 March 2026");
		expect(formatDayAndMonth(isoDate)).toBe("14 Mar");
	});

	it("uses the singular for a single unit", () => {
		expect(formatUnits(1)).toBe("1 unit");
		expect(formatUnits(0)).toBe("0 units");
		expect(formatUnits(3)).toBe("3 units");
	});

	it("uses the singular for a single product", () => {
		expect(formatProductCount(1)).toBe("1 product");
		expect(formatProductCount(4)).toBe("4 products");
	});

	it("uses the singular for a single review", () => {
		expect(formatReviewCount(1)).toBe("1 review");
		expect(formatReviewCount(3)).toBe("3 reviews");
	});

	it("tells a star rating out of five", () => {
		expect(formatStarRating(4)).toBe("4 out of 5 stars");
	});

	it("tells how many outfits a product belongs to", () => {
		expect(formatOutfitMembership(1)).toBe("In 1 outfit");
		expect(formatOutfitMembership(2)).toBe("In 2 outfits");
	});
});
