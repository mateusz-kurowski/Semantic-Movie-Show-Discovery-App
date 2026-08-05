import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { env } from "../models/envModel";

const getClient = async () => {
  const client = createClient({ url: env.redisUrl });
  await client.connect();
  return client;
};

const setVector = async (
  client: RedisClientType,
  key: string,
  vector: number[],
) => {
  await client.set(key, JSON.stringify(vector));
};

const getVector = async (
  client: RedisClientType,
  key: string,
): Promise<number[] | null> => {
  const result = await client.get(key);
  return result ? JSON.parse(result) : null;
};

const getVectors = async (
  client: RedisClientType,
  keys: string[],
): Promise<Record<string, number[] | null>> => {
  if (keys.length === 0) return {};
  const results = await client.mGet(keys);

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
