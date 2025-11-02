import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";

export class GetPositionUsecaseInput {
	driverId!: number;
}

export class GetPositionUsecaseOutput {
	constructor(public lat: number, public long: number) {}
}

export class GetPositionUsecase {
	constructor(
		private readonly driverPositionRepository: DriverPositionRepository
	) {}

	async execute(input: GetPositionUsecaseInput) {
		const driverPosition = await this.driverPositionRepository.getById(
			input.driverId
		);
		if (!driverPosition)
			throw Error("Driver doesn't exist or not in ready state");

		let output = new GetPositionUsecaseOutput(
			driverPosition.lat,
			driverPosition.long
		);
		return output;
	}
}
