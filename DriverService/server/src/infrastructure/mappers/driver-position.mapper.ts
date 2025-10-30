import { DriverPosition } from "../../domain/driver-position.entity";

export class DriverPositionMapper {
	static toDomain(raw: any): DriverPosition {
		if (!raw) return raw;

		let entity = DriverPosition.create(Number(raw.id));
		entity.lat = Number(raw.lat);
		entity.long = Number(raw.long);

		return entity;
	}

	static toPersistent(entity: DriverPosition): any {
		return {
			lat: entity.lat,
			long: entity.long,
		};
	}
}
