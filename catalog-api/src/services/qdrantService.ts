import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "../models/envModel";

const getClient = async () =>
  new QdrantClient({
    apiKey: env.qdrantApiKey,
    checkCompatibility: false,
    host: env.qdrantHost,
    https: false,
    port: env.qdrantPort,
  });

const semanticSearch = async (
  client: QdrantClient,
  collectionName: string,
  vector: number[],
  topK: number,
) => {
  const results = await client.query(collectionName, {
    limit: topK,
    query: vector,
    using: env.qdrantDenseVectorName,
    with_payload: true,
  });
  return results.points;
};

const hybridSearch = async (
  client: QdrantClient,
  collectionName: string,
  vector: number[],
  text: string,
  topK: number,
) => {
  const results = await client.query(collectionName, {
    limit: topK,
    prefetch: [
      { limit: topK * 2, query: vector, using: env.qdrantDenseVectorName },
      {
        limit: topK * 2,
        query: { model: "bm25", text },
        using: env.qdrantSparseVectorName,
      },
    ],
    query: { fusion: "rrf" },
    with_payload: true,
  });
  console.log(results.points);
  return results.points;
};

const qdrantService = {
  getClient,
  hybridSearch,
  semanticSearch,
};

export default qdrantService;
