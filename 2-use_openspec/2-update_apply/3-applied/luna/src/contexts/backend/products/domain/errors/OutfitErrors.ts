import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OutfitNameAlreadyExistsError extends CodelyError {}
export class OutfitProductNotFoundError extends CodelyError {}
export class OutfitNotFoundError extends CodelyError {}
