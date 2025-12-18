import Redis from "ioredis";
import { logger } from "../logger/pino.logger";

export class RedisCache {
	constructor(private readonly client: Redis) {}

	async get<T>(key: string): Promise<T | null> {
		logger.debug("Cache GET", { key });

		const data = await this.client.get(key);
		if (!data) {
			logger.debug("Cache MISS", { key });
			return null;
		}

		logger.debug("Cache HIT", { key });
		return JSON.parse(data) as T;
	}

	async set(key: string, value: any, ttl?: number) {
		logger.debug("Cache SET", { key, ttl });

		const payload = JSON.stringify(value);

		if (ttl) await this.client.set(key, payload, "EX", ttl);
		else await this.client.set(key, payload);
	}

	async delete(key: string) {
		logger.warn("Cache DELETE", { key });
		await this.client.del(key);
	}
}
