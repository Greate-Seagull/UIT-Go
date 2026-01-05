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
		logger.info("Updating position started", {
			driverId: input.id,
		});

		try {
			let driverPosition = DriverPosition.create(input);

			const updated = await this.driverPositionRepository.save(
				driverPosition
			);

			await this.driverPositionRepository.expire(updated, 5);

			const output = new UpdatePositionUsecaseOutput(
				updated.lat,
				updated.long
			);

			logger.info("Updating position completed", {
				driverId: input.id,
			});

			return output;
		} catch (err: any) {
			logger.error("Updating position failed", {
				driverId: input.id,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
