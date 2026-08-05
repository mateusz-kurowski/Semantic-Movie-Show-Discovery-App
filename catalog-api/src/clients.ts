import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import cacheService from "./services/cacheService";
import qdrantService from "./services/qdrantService";

export const qdrantClient = await qdrantService.getClient();
export const cacheClient = await cacheService.getClient();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool });
