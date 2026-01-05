import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";
import { logger } from "../infrastructure/logger/pino.logger";

export class GetPositionUsecaseInput {
	id!: number;
}

export class GetPositionUsecaseOutput {
	constructor(public lat: number, public long: number) {}
}

export class GetPositionUsecase {
	constructor(
		private readonly driverPositionRepository: DriverPositionRepository
	) {}

	async execute(input: GetPositionUsecaseInput) {
		logger.info("Getting position started", {
			driverId: input.id,
		});

		try {
			const driverPosition = await this.driverPositionRepository.getById(
				input.id
			);

			if (!driverPosition) {
				logger.warn("Driver position not found", {
					driverId: input.id,
				});
				throw Error("Driver doesn't exist or not in ready state");
			}

			const output = new GetPositionUsecaseOutput(
				driverPosition.lat,
				driverPosition.long
			);

			logger.info("Getting position completed", {
				driverId: input.id,
			});

			return output;
		} catch (err: any) {
			logger.error("Getting position failed", {
				driverId: input.id,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
