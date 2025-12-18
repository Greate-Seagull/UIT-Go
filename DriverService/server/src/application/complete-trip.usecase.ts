import { DriverState } from "../domain/entities/driver.entity";
import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
import { logger } from "../infrastructure/logger/pino.logger";

export class CompleteTripUsecaseInput {
	authId!: number;
	userId!: number;
	tripId!: number;
}

export class CompleteTripUsecaseOutput {
	constructor(public state: DriverState) {}
}

export class CompleteTripUsecase {
	constructor(
		private readonly driverRepository: DriverRepository,
		private readonly tripApiClient: TripApiClient,
		private readonly transactionManager: TransactionManager
	) {}

	async execute(input: CompleteTripUsecaseInput) {
		logger.info("Start CompleteTripUsecase.execute", {
			usecase: "CompleteTrip",
			driverId: input.authId,
			userId: input.userId,
			tripId: input.tripId,
		});

		try {
			logger.debug("Fetching driver", {
				driverId: input.authId,
			});

			const driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.error("Driver not found", { driverId: input.authId });
				throw Error(`Cannot find driver with id: ${input.authId}`);
			}

			if (driver.state !== DriverState.TRANSPORTING) {
				logger.warn("Driver not in TRANSPORTING state", {
					driverId: input.authId,
					state: driver.state,
				});
				throw Error(
					`The driver is not in transporting state: ${driver.state}`
				);
			}

			logger.info("Completing trip via Trip API", {
				driverId: input.authId,
				tripId: input.tripId,
			});

			await this.tripApiClient.completeTrip(input.authId, input.tripId);

			logger.debug("Trip completed successfully", {
				driverId: input.authId,
				tripId: input.tripId,
			});

			driver.state = DriverState.READY;

			logger.info("Saving driver state update", {
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

			const output = new CompleteTripUsecaseOutput(updatedDriver.state);

			logger.info("CompleteTripUsecase finished", {
				driverId: input.authId,
				finalState: updatedDriver.state,
			});

			return output;
		} catch (err: any) {
			logger.error("CompleteTripUsecase failed", {
				usecase: "CompleteTrip",
				driverId: input.authId,
				userId: input.userId,
				tripId: input.tripId,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
