import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";
import { logger } from "../infrastructure/logger/pino.logger";

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
		logger.info("Searching driver started", {
			lat: input.lat,
			lng: input.lng,
			radiusMeters: input.radiusMeters,
			limit: input.limit,
		});

		try {
			// Validation
			if (input.radiusMeters < 0) {
				logger.warn("Invalid radiusMeters", {
					radiusMeters: input.radiusMeters,
				});
				throw Error(
					`Expect a positive radius meter but got: ${input.radiusMeters}`
				);
			}

			if (input.limit < 0) {
				logger.warn("Invalid limit", { limit: input.limit });
				throw Error(`Expect a positive limit but got: ${input.limit}`);
			}

			const driverPositions = await this.driverPositionRepository.find(
				input.lat,
				input.lng,
				input.radiusMeters
			);

			const output = driverPositions.map(
				(driverPos: any) =>
					new SearchDriverUsecaseOutput(
						driverPos.id,
						driverPos.lat,
						driverPos.long
					)
			);

			logger.info("Searching trip completed", {
				requestLat: input.lat,
				requestLng: input.lng,
			});

			return output;
		} catch (err: any) {
			logger.error("Searching trip failed", {
				lat: input.lat,
				lng: input.lng,
				radiusMeters: input.radiusMeters,
				limit: input.limit,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
