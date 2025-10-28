import { DriverPosition } from "../domain/driver-position.entity";
import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";

export class UpdatePositionUsecaseInput {
	driverId!: number;
	lat!: number;
	long!: number;
}

export class UpdatePositionUsecaseOutput {
	constructor(public lat: number, public long: number) {}
}

export class UpdatePositionUsecase {
	constructor(
		private readonly driverPositionRepository: DriverPositionRepository
	) {}

	async execute(input: UpdatePositionUsecaseInput) {
		// let driverPosition = await this.driverPositionRepository.getById(
		// 	input.driverId
		// );
		// if (!driverPosition)
		// 	driverPosition = DriverPosition.create(input.driverId);

		let driverPosition = DriverPosition.create(input.driverId);
		driverPosition.lat = input.lat;
		driverPosition.long = input.long;

		const updated = await this.driverPositionRepository.save(
			driverPosition
		);

		await this.driverPositionRepository.expire(updated, 5);

		let output = new UpdatePositionUsecaseOutput(updated.lat, updated.long);
		return output;
	}
}
