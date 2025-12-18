import { DriverPosition } from "../domain/entities/driver-position.entity";
import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";
import { logger } from "../infrastructure/logger/pino.logger";

export class UpdatePositionUsecaseInput {
	id!: number;
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
		logger.info("Start UpdatePositionUsecase.execute", {
			usecase: "UpdatePosition",
			driverId: input.id,
			lat: input.lat,
			long: input.long,
		});

		try {
			logger.debug("Creating/updating driver position", {
				driverId: input.id,
				lat: input.lat,
				long: input.long,
			});

			let driverPosition = DriverPosition.create(input);

			const updated = await this.driverPositionRepository.save(
				driverPosition
			);

			logger.debug("Driver position saved", {
				driverId: input.id,
				lat: updated.lat,
				long: updated.long,
			});

			await this.driverPositionRepository.expire(updated, 5);

			logger.debug("Driver position expiration set", {
				driverId: input.id,
				ttlMinutes: 5,
			});

			const output = new UpdatePositionUsecaseOutput(
				updated.lat,
				updated.long
			);

			logger.info("UpdatePositionUsecase completed", {
				driverId: input.id,
				lat: output.lat,
				long: output.long,
			});

			return output;
		} catch (err: any) {
			logger.error("UpdatePositionUsecase failed", {
				usecase: "UpdatePosition",
				driverId: input.id,
				lat: input.lat,
				long: input.long,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
