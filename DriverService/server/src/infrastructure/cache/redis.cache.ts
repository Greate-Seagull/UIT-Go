import Redis from "ioredis";
import { logger } from "../logger/pino.logger";

export class RedisCache {
	constructor(private readonly client: Redis) {}

	async get<T>(key: string): Promise<T | null> {
		const data = await this.client.get(key);
		if (!data) {
			return null;
		}

		return JSON.parse(data) as T;
	}

	async set(key: string, value: any, ttl?: number) {
		const payload = JSON.stringify(value);

		if (ttl) await this.client.set(key, payload, "EX", ttl);
		else await this.client.set(key, payload);
	}

	async delete(key: string) {
		await this.client.del(key);
	}
}
