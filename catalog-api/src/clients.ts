import cacheService from "./services/cacheService";
import qdrantService from "./services/qdrantService";

export const qdrantClient = await qdrantService.getClient();
export const cacheClient = await cacheService.getClient();
