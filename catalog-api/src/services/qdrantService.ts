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
) =>
	await client.search(collectionName, {
		limit: topK,
		vector: {
			name: env.qdrantDenseVectorName,
			vector,
		},
		with_payload: true,
	});

const hybridSearch = async (
	client: QdrantClient,
	collectionName: string,
	vector: number[],
	text: string,
	topK: number,
) => {
	return await client.query(collectionName, {
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
};

const qdrantService = {
	getClient,
	hybridSearch,
	semanticSearch,
};

export default qdrantService;
