import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "bun";

const getClient = async () =>
	new QdrantClient({
		apiKey: env.QDRANT_API_KEY,
		checkCompatibility: false,
		https: true,
		url: env.QDRANT_URL,
	});

const qdrantService = {
	getClient,
};

export default qdrantService;
