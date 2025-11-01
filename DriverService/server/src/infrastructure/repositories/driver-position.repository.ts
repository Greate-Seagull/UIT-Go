import Redis from "ioredis";
import { DriverPosition } from "../../domain/driver-position.entity";
import { DriverPositionMapper } from "../mappers/driver-position.mapper";
import { en } from "zod/v4/locales";

export class DriverPositionRepository {
	private readonly GEO_KEY = "driver_positions";

	constructor(private readonly redis: Redis) {}

	async getById(id: any) {
		let persistences = await this.redis.geopos(this.GEO_KEY, id);
		let persistence = persistences[0];

		if (!persistence) return persistence;

		let row = {
			id: id,
			long: persistence[0],
			lat: persistence[1],
		};

		return DriverPositionMapper.toDomain(row);
	}

	async save(entity: DriverPosition): Promise<DriverPosition> {
		const persistence = DriverPositionMapper.toPersistent(entity);

		await this.redis.geoadd(
			this.GEO_KEY,
			persistence.long,
			persistence.lat,
			persistence.id
		);

		return this.getById(entity.id);
	}

	async expire(
		entity: DriverPosition,
		expiryInMinute: number
	): Promise<void> {
		await this.redis.expire(entity.id as any, 60 * expiryInMinute);
	}

	async find(lat: any, long: any, radiusMeters: any) {
		const results = await this.redis.geosearch(
			this.GEO_KEY,
			"FROMLONLAT",
			long,
			lat,
			"BYRADIUS",
			radiusMeters,
			"m",
			"WITHDIST"
		);

		return results.map((raw) => DriverPositionMapper.toDomain(raw));
	}
}
