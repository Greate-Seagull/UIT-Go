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
		logger.info("Start RejectTripUsecase.execute", {
			usecase: "RejectTrip",
			driverId: input.authId,
			offerId: input.offerId,
		});

		try {
			logger.debug("Fetching driver", {
				driverId: input.authId,
			});

			const driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.error("Driver not found", {
					driverId: input.authId,
				});
				throw Error(`Cannot find driver with id: ${input.authId}`);
			}

			logger.info("Calling Trip API to reject offer", {
				driverId: input.authId,
				offerId: input.offerId,
			});

			const tripResult = await this.tripApiClient.reject(
				input.authId,
				input.offerId
			);

			logger.debug("Trip offer rejected successfully", {
				driverId: input.authId,
				offerId: input.offerId,
				tripResult,
			});

			const output = new RejectTripUsecaseOutput();

			logger.info("RejectTripUsecase completed", {
				driverId: input.authId,
				offerId: input.offerId,
			});

			return output;
		} catch (err: any) {
			logger.error("RejectTripUsecase failed", {
				usecase: "RejectTrip",
				driverId: input.authId,
				offerId: input.offerId,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
