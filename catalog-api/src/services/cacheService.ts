import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { env } from "../models/envModel";

const getClient = async () => {
	const client = createClient({
		url: env.redisUrl,
		socket: {
			reconnectStrategy: (retries: number) => Math.min(retries * 100, 3000),
		},
	});
	client.on("error", (err) => console.error("[Redis] client error...", err));
	try {
		await client.connect();
	} catch (err) {
		console.error(
			"[Redis] initial connect failed, continuing with degraded cache...",
			err,
		);
	}
	return client;
};

const setVector = async (
	client: RedisClientType,
	key: string,
	vector: number[],
) => {
	try {
		if (!client.isOpen) return;
		await client.set(key, JSON.stringify(vector));
	} catch (err) {
		console.warn("[Redis] setVector failed, skipping cache write...", err);
	}
};

const getVector = async (
	client: RedisClientType,
	key: string,
): Promise<number[] | null> => {
	try {
		if (!client.isOpen) return null;
		const result = await client.get(key);
		return result ? JSON.parse(result) : null;
	} catch (err) {
		console.warn("[Redis] getVector failed, returning null...", err);
		return null;
	}
};

const getVectors = async (
	client: RedisClientType,
	keys: string[],
): Promise<Record<string, number[] | null>> => {
	if (keys.length === 0) return {};
	try {
		if (!client.isOpen) {
			const fallback: Record<string, number[] | null> = {};
			keys.forEach((key) => {
				fallback[key] = null;
			});
			return fallback;
		}
		const results = await client.mGet(keys);

		const map: Record<string, number[] | null> = {};
		keys.forEach((key, index) => {
			map[key] = results[index] ? JSON.parse(results[index] as string) : null;
		});
		return map;
	} catch (err) {
		console.warn("[Redis] getVectors failed, returning nulls...", err);
		const fallback: Record<string, number[] | null> = {};
		keys.forEach((key) => {
			fallback[key] = null;
		});
		return fallback;
	}
};

const cacheService = {
	getClient,
	getVector,
	getVectors,
	setVector,
};

export default cacheService;
