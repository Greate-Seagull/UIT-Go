import Redis from "ioredis";
import { DriverPosition } from "../../domain/driver-position.entity";
import { DriverPositionMapper } from "../mappers/driver-position.mapper";

export class DriverPositionRepository {
	constructor(private readonly redis: Redis) {}

	async getById(id: any): Promise<DriverPosition> {
		let row = await this.redis.hgetall(id);
		row.id = id;
		return DriverPositionMapper.toDomain(row);
	}

	async save(entity: DriverPosition): Promise<DriverPosition> {
		await this.redis.hmset(
			entity.id as any,
			DriverPositionMapper.toPersistent(entity)
		);

		return this.getById(entity.id);
	}

	async expire(
		entity: DriverPosition,
		expiryInMinute: number
	): Promise<void> {
		await this.redis.expire(entity.id as any, 60 * expiryInMinute);
	}
}
