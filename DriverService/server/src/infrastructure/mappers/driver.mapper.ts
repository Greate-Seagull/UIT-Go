import { Driver, DriverState } from "../../domain/driver.entity";

export class DriverMapper {
	static toDomain(raw: any): Driver {
		if (!raw) return raw;

		let entity = Driver.create(Number(raw.id));
		entity.state = raw.state;

		return entity;
	}
}
