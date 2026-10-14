import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RetailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

import { PendingReviewResponseMother } from "../responses/PendingReviewResponseMother";
import { ProductResponseMother } from "../responses/ProductResponseMother";
import { ProductReviewsResponseMother } from "../responses/ProductReviewsResponseMother";
import { ReviewEligibilityResponseMother } from "../responses/ReviewEligibilityResponseMother";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
	headers: vi.fn(),
}));

const baseUrl = "http://retail-api.test";

const fetchMock = vi.fn<typeof fetch>();

function apiWithIncomingHeaders(incoming: HeadersInit = {}): RetailApi {
	return new RetailApi(baseUrl, () => Promise.resolve(new Headers(incoming)));
}

function respondWith(status: number, body?: unknown): void {
	fetchMock.mockResolvedValue(
		body === undefined
			? new Response(null, { status })
			: Response.json(body, { status }),
	);
}

function lastRequest(): { url: string; init: RequestInit } {
	const [url, init] = fetchMock.mock.lastCall ?? [];

	return { url: String(url), init: init ?? {} };
}

function lastRequestHeaders(): Headers {
	return new Headers(lastRequest().init.headers);
}

describe("RetailApi should", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("search products filtering by the given collection and category", async () => {
		const products = [ProductResponseMother.create()];
		respondWith(200, products);

		const found = await apiWithIncomingHeaders().productsSearcher.search({
			collection: "Hexagonal",
			category: "Tees",
		});

		expect(found).toEqual(products);
		expect(lastRequest().url).toBe(
			`${baseUrl}/products?collection=Hexagonal&category=Tees`,
		);
	});

	it("search every product when there are no filters", async () => {
		respondWith(200, []);

		await apiWithIncomingHeaders().productsSearcher.search();

		expect(lastRequest().url).toBe(`${baseUrl}/products`);
	});

	it("never let Next cache the responses", async () => {
		respondWith(200, []);

		await apiWithIncomingHeaders().categoriesLister.list();

		expect(lastRequest().init.cache).toBe("no-store");
	});

	it("forward the session headers of the incoming request", async () => {
		respondWith(200, { itemCount: 0 });

		await apiWithIncomingHeaders({
			cookie: "session=abc",
			authorization: "Bearer token",
			"user-agent": "browser",
		}).cartItemCounter.count();

		expect(lastRequestHeaders().get("cookie")).toBe("session=abc");
		expect(lastRequestHeaders().get("authorization")).toBe("Bearer token");
		expect(lastRequestHeaders().has("user-agent")).toBe(false);
	});

	it("return null when the product does not exist", async () => {
		respondWith(404, {
			error: { type: "ProductNotFoundError", message: "not found" },
		});

		expect(
			await apiWithIncomingHeaders().productFinder.find("missing"),
		).toBeNull();
	});

	it("encode ids in the path", async () => {
		respondWith(404, {
			error: { type: "OrderNotFoundError", message: "not found" },
		});

		await apiWithIncomingHeaders().userOrderFinder.find("a/b");

		expect(lastRequest().url).toBe(`${baseUrl}/me/orders/a%2Fb`);
	});

	it("fail when a not found response is not the expected one", async () => {
		respondWith(404, "Not Found");

		await expect(
			apiWithIncomingHeaders().outfitFinder.find("outfit-1"),
		).rejects.toBeInstanceOf(RetailApiError);
	});

	it("unwrap the cart item count", async () => {
		respondWith(200, { itemCount: 3 });

		expect(await apiWithIncomingHeaders().cartItemCounter.count()).toBe(3);
		expect(lastRequest().url).toBe(`${baseUrl}/me/checkout/item-count`);
	});

	it("send the variant added to the cart as JSON", async () => {
		respondWith(204);

		await apiWithIncomingHeaders().cartVariantAdder.add("tee-m");

		expect(lastRequest().url).toBe(`${baseUrl}/me/checkout/lines`);
		expect(lastRequest().init.method).toBe("POST");
		expect(lastRequest().init.body).toBe(
			JSON.stringify({ variantId: "tee-m" }),
		);
		expect(lastRequestHeaders().get("content-type")).toBe(
			"application/json",
		);
	});

	it("return the id of the confirmed order", async () => {
		respondWith(201, { orderId: "order-1" });

		expect(await apiWithIncomingHeaders().checkoutConfirmer.confirm()).toBe(
			"order-1",
		);
		expect(lastRequest().url).toBe(`${baseUrl}/me/checkout/confirmation`);
	});

	it("update an outfit with its name and products", async () => {
		respondWith(204);

		await apiWithIncomingHeaders().outfitUpdater.update(
			"outfit-1",
			"Weekend",
			["tee", "jeans"],
		);

		expect(lastRequest().url).toBe(`${baseUrl}/outfits/outfit-1`);
		expect(lastRequest().init.method).toBe("PUT");
		expect(lastRequest().init.body).toBe(
			JSON.stringify({ name: "Weekend", productIds: ["tee", "jeans"] }),
		);
	});

	it("get the approved reviews of a product", async () => {
		const reviews = ProductReviewsResponseMother.create();
		respondWith(200, reviews);

		expect(
			await apiWithIncomingHeaders().productReviewsGetter.get("a/b"),
		).toEqual(reviews);
		expect(lastRequest().url).toBe(`${baseUrl}/products/a%2Fb/reviews`);
		expect(lastRequest().init.method).toBe("GET");
	});

	it("check whether the current customer can review a product", async () => {
		respondWith(200, ReviewEligibilityResponseMother.create("can-review"));

		expect(
			await apiWithIncomingHeaders().reviewEligibilityChecker.check(
				"hoodie & co",
			),
		).toEqual({ status: "can-review" });
		expect(lastRequest().url).toBe(
			`${baseUrl}/me/reviews/eligibility?productId=hoodie+%26+co`,
		);
	});

	it("submit a review as JSON", async () => {
		respondWith(201);

		await apiWithIncomingHeaders().reviewSubmitter.submit(
			"hoodie",
			4,
			"Warm and comfy",
			"Thick fabric.",
		);

		expect(lastRequest().url).toBe(`${baseUrl}/me/reviews`);
		expect(lastRequest().init.method).toBe("POST");
		expect(lastRequest().init.body).toBe(
			JSON.stringify({
				productId: "hoodie",
				rating: 4,
				title: "Warm and comfy",
				body: "Thick fabric.",
			}),
		);
		expect(lastRequestHeaders().get("content-type")).toBe(
			"application/json",
		);
	});

	it("fail with the review error the API responded with", async () => {
		respondWith(403, {
			error: {
				type: "ProductNotPurchasedError",
				message: "not purchased",
			},
		});

		await expect(
			apiWithIncomingHeaders().reviewSubmitter.submit(
				"hoodie",
				4,
				"Warm and comfy",
				"Thick fabric.",
			),
		).rejects.toMatchObject({
			status: 403,
			type: "ProductNotPurchasedError",
		});
	});

	it("list the reviews awaiting moderation", async () => {
		const pending = [PendingReviewResponseMother.create()];
		respondWith(200, pending);

		expect(
			await apiWithIncomingHeaders().pendingReviewsLister.list(),
		).toEqual(pending);
		expect(lastRequest().url).toBe(`${baseUrl}/reviews/pending`);
	});

	it.each([
		["approve", "approval"],
		["reject", "rejection"],
	] as const)(
		"%s a review with an empty POST",
		async (decision, subresource) => {
			respondWith(204);
			const api = apiWithIncomingHeaders();

			await (decision === "approve"
				? api.reviewApprover.approve("review/1")
				: api.reviewRejecter.reject("review/1"));

			expect(lastRequest().url).toBe(
				`${baseUrl}/reviews/review%2F1/${subresource}`,
			);
			expect(lastRequest().init.method).toBe("POST");
			expect(lastRequest().init.body).toBeUndefined();
		},
	);

	it("fail with a moderation error the API responded with", async () => {
		respondWith(409, {
			error: {
				type: "ReviewAlreadyModeratedError",
				message: "already moderated",
			},
		});

		await expect(
			apiWithIncomingHeaders().reviewApprover.approve("review-1"),
		).rejects.toMatchObject({
			status: 409,
			type: "ReviewAlreadyModeratedError",
		});
	});

	it("fail with the error type and status the API responded with", async () => {
		respondWith(409, {
			error: { type: "VariantOutOfStockError", message: "no stock" },
		});

		await expect(
			apiWithIncomingHeaders().cartVariantAdder.add("tee-m"),
		).rejects.toMatchObject({
			status: 409,
			type: "VariantOutOfStockError",
			message: "no stock",
		});
	});

	it("fail with an unexpected response error when the body is not an API error", async () => {
		fetchMock.mockResolvedValue(
			new Response("<html>Bad gateway</html>", { status: 502 }),
		);

		await expect(
			apiWithIncomingHeaders().ordersLister.list(),
		).rejects.toMatchObject({
			status: 502,
			type: "UnexpectedResponseError",
		});
	});
});
