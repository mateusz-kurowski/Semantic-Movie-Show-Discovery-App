import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../models/envModel";

const getClient = async () =>
  new QdrantClient({
    apiKey: env.qdrantApiKey,
    checkCompatibility: false,
    url: env.qdrantUrl,
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
