import Redis from "ioredis";
import { DriverPosition } from "../../domain/entities/driver-position.entity";
import { logger } from "../../infrastructure/logger/pino.logger";
import { toPersistence } from "./buildSqlQuery";

export class DriverPositionRepository {
	public static readonly GEO_KEY = "driver_positions";

	constructor(private readonly redis: Redis) {}

	async getById(id: any): Promise<any> {
		logger.debug("Fetching driver position by ID", { id });

		let persistences = await this.redis.geopos(
			DriverPositionRepository.GEO_KEY,
			id
		);
		let persistence = persistences[0];

		if (!persistence) {
			logger.debug("Driver position not found", { id });
			return persistence;
		}

		let row = { id, long: persistence[0], lat: persistence[1] };
		const domain = DriverPosition.rehydrate(row);

		logger.debug("Driver position found", { id, domain });
		return domain;
	}

	async save(entity: any): Promise<any> {
		logger.debug("Saving driver position", { entity });

		const persistence = toPersistence(entity);
		await this.redis.geoadd(
			DriverPositionRepository.GEO_KEY,
			persistence.long,
			persistence.lat,
			entity.id
		);

		const saved = await this.getById(entity.id);
		logger.info("Driver position saved", { id: entity.id, saved });
		return saved;
	}

	async expire(entity: any, expiryInMinute: number): Promise<void> {
		logger.debug("Setting expiry for driver position", {
			id: entity.id,
			expiryInMinute,
		});

		await this.redis.expire(entity.id as any, 60 * expiryInMinute);

		logger.info("Expiry set for driver position", { id: entity.id });
	}

	async find(lat: any, long: any, radiusMeters: any): Promise<any> {
		logger.debug("Finding drivers within radius", {
			lat,
			long,
			radiusMeters,
		});

		const results = await this.redis.georadius(
			DriverPositionRepository.GEO_KEY,
			long,
			lat,
			radiusMeters,
			"m",
			"WITHCOORD"
		);

		const entities = results.map((result: any) => {
			let raw = { id: result[0], long: result[1][0], lat: result[1][1] };
			return DriverPosition.rehydrate(raw);
		});

		logger.info("Found drivers", { count: entities.length, entities });
		return entities;
	}
}
