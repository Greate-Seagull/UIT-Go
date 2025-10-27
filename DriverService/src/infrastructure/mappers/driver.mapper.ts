import { Driver, DriverState } from "../../domain/driver.entity";

export class DriverMapper {
	static toDomain(raw: any): Driver {
		let entity = new Driver();
		entity.id = raw.id;
		entity.state = raw.state;

		return entity;
	}
}
