import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";

export class SearchDriverUsecaseInput {
	lat!: number;
	lng!: number;
	radiusMeters!: number;
	limit!: number;
}

export class SearchDriverUsecaseOutput {
	constructor(
		public driverId: number,
		public lat: number,
		public long: number
	) {}
}

export class SearchDriverUsecase {
	constructor(
		private readonly driverPositionRepository: DriverPositionRepository
	) {}

	async execute(input: SearchDriverUsecaseInput) {
		if (input.radiusMeters < 0)
			throw Error(
				`Expect a positive radius metter but got: ${input.radiusMeters}`
			);

		if (input.limit < 0)
			throw Error(`Expect a positive limit but got: ${input.limit}`);

		const driverPositions = await this.driverPositionRepository.find(
			input.lat,
			input.lng,
			input.radiusMeters
		);

		const output = driverPositions.map(
			(driverPos) =>
				new SearchDriverUsecaseOutput(
					driverPos.id,
					driverPos.lat,
					driverPos.long
				)
		);
		return output;
	}
}
