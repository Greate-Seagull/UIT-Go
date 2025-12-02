import { PrismaClient } from "@prisma/client";
import { Driver, driverSchema } from "../../domain/entities/driver.entity";
import { Transaction } from "./transaction";
import { logger } from "../logger/pino.logger";
import { RedisCache } from "../cache/redis.cache";
import { normalizeCachedObject } from "../cache/normalized-cache";
import { buildQuery, toPersistence } from "./buildSqlQuery";

export class DriverRepository {
	constructor(
		private prisma: PrismaClient,
		private readonly cache: RedisCache
	) {}

	public static cacheTtl: number = 900;

	public static baseQuery = buildQuery(driverSchema);

	private cacheKey(id: number) {
		return `driver:${id}`;
	}

	async getById(id: number): Promise<any> {
		logger.debug("DriverRepository.getById called", { id });

		const key = this.cacheKey(id);

		// Try cache first
		const cached = await this.cache.get<Driver>(key);
		if (cached) {
			const normalized = normalizeCachedObject(cached);
			const domain = Driver.rehydrate(normalized);
			logger.info("Driver loaded from cache", {
				data: cached,
			});
			return domain;
		}

		logger.warn("Driver cache MISS → loading from DB", { id });

		const row = await this.prisma.driver.findUnique({
			where: { id },
			select: DriverRepository.baseQuery,
		});

		if (!row) {
			logger.error("Driver not found in DB", { id });
			return null;
		}

		const domain = Driver.rehydrate(row);

		// Write to cache
		await this.cache.set(key, domain, DriverRepository.cacheTtl);

		logger.info("Driver cached after DB fetch", { id });

		return domain;
	}

	async add(tx: Transaction | null, entity: any): Promise<any> {
		logger.debug("DriverRepository.add called", { id: entity.id });

		const repo = tx ? tx.driver : this.prisma.driver;

		const row = await repo.create({
			data: toPersistence(entity),
			select: DriverRepository.baseQuery,
		});

		const domain = Driver.rehydrate(row) as any;

		await this.cache.set(
			this.cacheKey(domain.id),
			domain,
			DriverRepository.cacheTtl
		);

		logger.info("Driver added & cached", { id: domain.id });

		return domain;
	}

	async save(tx: Transaction | null, entity: any): Promise<any> {
		logger.debug("DriverRepository.save called", {
			id: entity.id,
			newState: entity.state,
		});

		const repo = tx ? tx.driver : this.prisma.driver;

		const row = await repo.update({
			where: { id: entity.id },
			data: toPersistence(entity),
			select: DriverRepository.baseQuery,
		});

		const domain = Driver.rehydrate(row) as any;

		// update cache
		await this.cache.set(
			this.cacheKey(domain.id),
			domain,
			DriverRepository.cacheTtl
		);

		logger.info("Driver updated & cache refreshed", {
			id: entity.id,
			state: entity.state,
		});

		return domain;
	}
}
