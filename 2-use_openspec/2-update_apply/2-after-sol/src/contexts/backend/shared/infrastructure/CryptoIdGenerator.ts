import { randomUUID } from "node:crypto";

import { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

export class CryptoIdGenerator extends IdGenerator {
	generate(): string {
		return randomUUID();
	}
}
