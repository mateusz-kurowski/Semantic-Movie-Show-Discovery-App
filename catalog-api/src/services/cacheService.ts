import { env, RedisClient } from "bun";

const getClient = async () =>
	new RedisClient(env.REDIS_URL || "redis://localhost:6379");

const setVector = async (
	client: RedisClient,
	key: string,
	vector: number[],
) => {
	await client.set(key, JSON.stringify(vector));
};

const getVector = async (
	client: RedisClient,
	key: string,
): Promise<number[] | null> => {
	const result = await client.get(key);
	return result ? JSON.parse(result) : null;
};

const getVectors = async (
	client: RedisClient,
	keys: string[],
): Promise<Record<string, number[] | null>> => {
	if (keys.length === 0) return {};
	const results = await client.mget(...keys);

	const map: Record<string, number[] | null> = {};
	keys.forEach((key, index) => {
		map[key] = results[index] ? JSON.parse(results[index] as string) : null;
	});
	return map;
};

const cacheService = {
	getClient,
	getVector,
	getVectors,
	setVector,
};

export default cacheService;
