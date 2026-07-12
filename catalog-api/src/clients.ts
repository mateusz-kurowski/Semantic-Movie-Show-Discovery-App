import { env as bunEnv, SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import cacheService from "./services/cacheService";
import qdrantService from "./services/qdrantService";

export const qdrantClient = await qdrantService.getClient();
export const cacheClient = await cacheService.getClient();

const dbClient = new SQL(bunEnv.DATABASE_URL!);
export const db = drizzle({ client: dbClient });
