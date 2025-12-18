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
		logger.info("Start GetPositionUsecase.execute", {
			usecase: "GetPosition",
			driverId: input.id,
		});

		try {
			logger.debug("Fetching driver position", {
				driverId: input.id,
			});

			const driverPosition = await this.driverPositionRepository.getById(
				input.id
			);

			if (!driverPosition) {
				logger.warn("Driver position not found", {
					driverId: input.id,
				});
				throw Error("Driver doesn't exist or not in ready state");
			}

			logger.debug("Driver position retrieved", {
				driverId: input.id,
				lat: driverPosition.lat,
				long: driverPosition.long,
			});

			const output = new GetPositionUsecaseOutput(
				driverPosition.lat,
				driverPosition.long
			);

			logger.info("GetPositionUsecase completed", {
				driverId: input.id,
				lat: output.lat,
				long: output.long,
			});

			return output;
		} catch (err: any) {
			logger.error("GetPositionUsecase failed", {
				usecase: "GetPosition",
				driverId: input.id,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
