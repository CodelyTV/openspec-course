import "server-only";

import { headers } from "next/headers";

import type {
	CheckoutResponse,
	CurrentUserResponse,
	InventoryReportResponse,
	LowStockReportResponse,
	MyOrderResponse,
	OrderDetailResponse,
	OrderResponse,
	OrdersSummaryResponse,
	OutfitResponse,
	OutfitSummaryResponse,
	ProductFilters,
	ProductResponse,
	ProductSuggestionsResponse,
} from "./responses";
import { RetailApiError } from "./RetailApiError";

type IncomingRequestHeaders = () => Promise<Headers>;

const defaultRetailApiUrl = "http://localhost:3001";

const headersForwardedToTheApi = ["cookie", "authorization"];

export class RetailApi {
	readonly productsSearcher = {
		search: (filters: ProductFilters = {}): Promise<ProductResponse[]> =>
			this.get(`/products${queryStringOf(filters)}`),
	};

	readonly categoriesLister = {
		list: (): Promise<string[]> => this.get("/categories"),
	};

	readonly collectionsLister = {
		list: (): Promise<string[]> => this.get("/collections"),
	};

	readonly productFinder = {
		find: (id: string): Promise<ProductResponse | null> =>
			this.find(`/products/${pathSegment(id)}`, "ProductNotFoundError"),
	};

	readonly productSuggestionsFinder = {
		find: (productId: string): Promise<ProductSuggestionsResponse> =>
			this.get(`/products/${pathSegment(productId)}/suggestions`),
	};

	readonly inventoryLister = {
		list: (): Promise<InventoryReportResponse> => this.get("/inventory"),
	};

	readonly lowStockLister = {
		list: (): Promise<LowStockReportResponse> =>
			this.get("/inventory/low-stock"),
	};

	readonly outfitsLister = {
		list: (): Promise<OutfitSummaryResponse[]> => this.get("/outfits"),
	};

	readonly outfitFinder = {
		find: (id: string): Promise<OutfitResponse | null> =>
			this.find(`/outfits/${pathSegment(id)}`, "OutfitNotFoundError"),
	};

	readonly outfitCreator = {
		create: async (name: string, productIds: string[]): Promise<void> => {
			await this.request("POST", "/outfits", { name, productIds });
		},
	};

	readonly outfitUpdater = {
		update: async (
			id: string,
			name: string,
			productIds: string[],
		): Promise<void> => {
			await this.request("PUT", `/outfits/${pathSegment(id)}`, {
				name,
				productIds,
			});
		},
	};

	readonly outfitDeleter = {
		delete: async (id: string): Promise<void> => {
			await this.request("DELETE", `/outfits/${pathSegment(id)}`);
		},
	};

	readonly ordersLister = {
		list: (): Promise<OrderResponse[]> => this.get("/orders"),
	};

	readonly recentOrdersLister = {
		list: (limit: number): Promise<OrderResponse[]> =>
			this.get(`/orders/recent?limit=${limit}`),
	};

	readonly ordersSummaryGetter = {
		get: (): Promise<OrdersSummaryResponse> => this.get("/orders/summary"),
	};

	readonly orderFinder = {
		find: (id: string): Promise<OrderDetailResponse | null> =>
			this.find(`/orders/${pathSegment(id)}`, "OrderNotFoundError"),
	};

	readonly currentUserGetter = {
		get: (): Promise<CurrentUserResponse> => this.get("/me"),
	};

	readonly userOrdersLister = {
		list: (): Promise<MyOrderResponse[]> => this.get("/me/orders"),
	};

	readonly userOrderFinder = {
		find: (id: string): Promise<OrderDetailResponse | null> =>
			this.find(`/me/orders/${pathSegment(id)}`, "OrderNotFoundError"),
	};

	readonly checkoutViewGetter = {
		get: (): Promise<CheckoutResponse> => this.get("/me/checkout"),
	};

	readonly cartItemCounter = {
		count: async (): Promise<number> => {
			const { itemCount } = await this.get<{ itemCount: number }>(
				"/me/checkout/item-count",
			);

			return itemCount;
		},
	};

	readonly cartVariantAdder = {
		add: async (variantId: string): Promise<void> => {
			await this.request("POST", "/me/checkout/lines", { variantId });
		},
	};

	readonly cartVariantRemover = {
		remove: async (variantId: string): Promise<void> => {
			await this.request(
				"DELETE",
				`/me/checkout/lines/${pathSegment(variantId)}`,
			);
		},
	};

	readonly checkoutConfirmer = {
		confirm: async (): Promise<string> => {
			const response = await this.request(
				"POST",
				"/me/checkout/confirmation",
			);
			const { orderId } = (await response.json()) as { orderId: string };

			return orderId;
		},
	};

	constructor(
		private readonly baseUrl: string,
		private readonly incomingRequestHeaders: IncomingRequestHeaders,
	) {}

	private async get<T>(path: string): Promise<T> {
		const response = await this.request("GET", path);

		return (await response.json()) as T;
	}

	private async find<T>(
		path: string,
		notFoundErrorType: string,
	): Promise<T | null> {
		try {
			return await this.get<T>(path);
		} catch (error) {
			if (
				error instanceof RetailApiError &&
				error.status === 404 &&
				error.type === notFoundErrorType
			) {
				return null;
			}

			throw error;
		}
	}

	private async request(
		method: "GET" | "POST" | "PUT" | "DELETE",
		path: string,
		body?: unknown,
	): Promise<Response> {
		const requestHeaders = await this.forwardedHeaders();

		if (body !== undefined) {
			requestHeaders.set("content-type", "application/json");
		}

		const response = await fetch(`${this.baseUrl}${path}`, {
			method,
			headers: requestHeaders,
			body: body === undefined ? undefined : JSON.stringify(body),
			cache: "no-store",
		});

		if (!response.ok) {
			throw await RetailApiError.fromResponse(response);
		}

		return response;
	}

	private async forwardedHeaders(): Promise<Headers> {
		const incoming = await this.incomingRequestHeaders();
		const forwarded = new Headers({ accept: "application/json" });

		for (const name of headersForwardedToTheApi) {
			const value = incoming.get(name);

			if (value !== null) {
				forwarded.set(name, value);
			}
		}

		return forwarded;
	}
}

function pathSegment(value: string): string {
	return encodeURIComponent(value);
}

function queryStringOf(filters: ProductFilters): string {
	const query = new URLSearchParams();

	if (filters.collection !== undefined) {
		query.set("collection", filters.collection);
	}

	if (filters.category !== undefined) {
		query.set("category", filters.category);
	}

	const queryString = query.toString();

	return queryString.length > 0 ? `?${queryString}` : "";
}

export const retailApi = new RetailApi(
	process.env.RETAIL_API_URL ?? defaultRetailApiUrl,
	async () => new Headers(await headers()),
);
