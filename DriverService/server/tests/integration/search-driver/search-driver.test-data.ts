import { DriverPosition } from "../../../src/domain/driver-position.entity";

export const queryInput = {
	lat: 1,
	lng: 1,
	radiusMeters: 3000,
	limit: 10,
};

export const driverPositionData = DriverPosition.create(5);
driverPositionData.lat = 1.004;
driverPositionData.long = 1.002;
