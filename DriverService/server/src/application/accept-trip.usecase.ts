import { DriverState } from "../domain/entities/driver.entity";
import { TripApiClient } from "../infrastructure/clients/trip.client";
import { logger } from "../infrastructure/logger/pino.logger";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";

export class AcceptTripUsecaseInput {
	authId!: number;
	offerId!: number;
}

export class AcceptTripUsecaseOutput {
	constructor(public state: DriverState) {}
}

export class AcceptTripUsecase {
	constructor(
		private readonly driverRepository: DriverRepository,
		private readonly tripApiClient: TripApiClient,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(input: AcceptTripUsecaseInput) {
		logger.info("Start AcceptTripUsecase.execute", {
			usecase: "AcceptTrip",
			driverId: input.authId,
			offerId: input.offerId,
		});

		try {
			logger.debug("Fetching driver", { driverId: input.authId });

			const driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.error("Driver not found", {
					driverId: input.authId,
				});
				throw Error(`Cannot find driver with id: ${input.authId}`);
			}

			if (driver.state !== DriverState.READY) {
				logger.warn("Driver not in READY state", {
					driverId: input.authId,
					state: driver.state,
				});
				throw Error(
					`The driver is not in ready state: ${driver.state}`
				);
			}

			logger.info("Calling trip service to assign driver", {
				driverId: input.authId,
				offerId: input.offerId,
			});

			const tripResult = await this.tripApiClient.assignDriver(
				input.authId,
				input.offerId
			);

			logger.debug("Trip service assigned successfully", {
				driverId: input.authId,
				offerId: input.offerId,
				tripResult,
			});

			driver.state = DriverState.TRANSPORTING;

			logger.info("Saving updated driver state", {
				driverId: input.authId,
				newState: driver.state,
			});

			const updatedDriver = await this.transactionManager.transaction(
				async (transaction) => {
					return await this.driverRepository.save(
						transaction,
						driver
					);
				}
			);

			let output = new AcceptTripUsecaseOutput(updatedDriver.state);

			logger.info("AcceptTripUsecase completed", {
				driverId: input.authId,
				finalState: updatedDriver.state,
			});

			return output;
		} catch (err: any) {
			logger.error("AcceptTripUsecase failed", {
				usecase: "AcceptTrip",
				driverId: input.authId,
				offerId: input.offerId,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
