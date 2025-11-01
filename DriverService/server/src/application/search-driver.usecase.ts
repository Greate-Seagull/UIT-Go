import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";

export class SearchDriverUsecaseInput {
	lat!: number;
	lng!: number;
	radiusMeters!: number;
	limit!: number;
}

export class SearchDriverUsecase {
	constructor(
		private readonly driverPositionRepository: DriverPositionRepository
	) {}

	async execute(input: SearchDriverUsecaseInput) {
		console.log("enter use case");
		if (input.radiusMeters < 0)
			throw Error(
				`Expect a positive radius metter but got: ${input.radiusMeters}`
			);

		if (input.limit < 0)
			throw Error(`Expect a positive limit but got: ${input.limit}`);

		const driverPositions = this.driverPositionRepository.find(
			input.lat,
			input.lng,
			input.radiusMeters
		);

		return driverPositions;
	}
}
