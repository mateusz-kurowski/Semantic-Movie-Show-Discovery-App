import type { InferSelectModel } from "drizzle-orm";
import type { movie } from "../db/catalog-schema";

export type Movie = InferSelectModel<typeof movie>;
