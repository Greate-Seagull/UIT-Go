import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { logger } from "../infrastructure/logger/pino.logger";

export class RejectTripUsecaseInput {
	authId!: number;
	offerId!: number;
}

export class RejectTripUsecaseOutput {}

export class RejectTripUsecase {
	constructor(
		private readonly driverRepository: DriverRepository,
		private readonly tripApiClient: TripApiClient
	) {}

	async execute(input: RejectTripUsecaseInput) {
		logger.info("Rejecting trip started", {
			driverId: input.authId,
			offerId: input.offerId,
		});

		try {
			const driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.warn("Driver not found", {
					driverId: input.authId,
				});
				throw Error(`Cannot find driver with id: ${input.authId}`);
			}

			const tripResult = await this.tripApiClient.reject(
				input.authId,
				input.offerId
			);

			const output = new RejectTripUsecaseOutput();

			logger.info("Rejecting trip completed", {
				driverId: input.authId,
				offerId: input.offerId,
			});

			return output;
		} catch (err: any) {
			logger.error("Rejecting trip failed", {
				driverId: input.authId,
				offerId: input.offerId,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
