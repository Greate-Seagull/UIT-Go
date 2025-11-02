import { en } from "zod/v4/locales";
import { DriverPosition } from "../../domain/driver-position.entity";

export class DriverPositionMapper {
	static toDomain(raw: any) {
		if (!raw) return raw;

		let entity = DriverPosition.create(Number(raw.id));
		entity.lat = Number(raw.lat);
		entity.long = Number(raw.long);

		return entity;
	}

	static toPersistent(entity: DriverPosition): any {
		return {
			id: entity.id,
			lat: entity.lat,
			long: entity.long,
		};
	}
}
