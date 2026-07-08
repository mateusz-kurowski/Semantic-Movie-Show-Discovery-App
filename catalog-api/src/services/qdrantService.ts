import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../models/envModel";

const getClient = async () =>
  new QdrantClient({
    apiKey: env.qdrantApiKey,
    checkCompatibility: false,
    host: env.qdrantHost,
    port: env.qdrantPort,
    https: false,
  });

const searchPoints = async (
  client: QdrantClient,
  collectionName: string,
  vector: number[],
  topK: number,
) =>
  await client.search(collectionName, {
    limit: topK,
    vector: {
      name: env.qdrantDenseVectorName,
      vector,
    },
    with_payload: true,
  });

const qdrantService = {
  getClient,
  searchPoints,
};

export default qdrantService;
