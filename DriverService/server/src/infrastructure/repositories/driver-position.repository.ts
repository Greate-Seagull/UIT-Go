import { Cluster } from "ioredis";
import { DriverPosition } from "../../domain/entities/driver-position.entity";
import { toPersistence } from "./buildSqlQuery";

export class DriverPositionRepository {
	public static readonly GEO_KEY = "driver_positions";

	constructor(private readonly redis: Cluster) {}

	async getById(id: any): Promise<any> {
		let persistences = await this.redis.geopos(
			DriverPositionRepository.GEO_KEY,
			id
		);
		let persistence = persistences[0];

		if (!persistence) {
			return persistence;
		}

		let row = { id, long: persistence[0], lat: persistence[1] };
		return DriverPosition.rehydrate(row);
	}

	async save(entity: any): Promise<void> {
		const persistence = toPersistence(entity);
		await this.redis.geoadd(
			DriverPositionRepository.GEO_KEY,
			persistence.long,
			persistence.lat,
			entity.id
		);
	}

	async find(lat: any, long: any, radiusMeters: any): Promise<any> {
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

		return entities;
	}
}
