import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "bun";

const getClient = async () =>
  new QdrantClient({
    apiKey: env.QDRANT_API_KEY,
    url: env.QDRANT_URL,
    checkCompatibility: false,
    https: true,
  });

const qdrantService = {
  getClient,
};

export default qdrantService;
