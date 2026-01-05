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
		logger.info("Completting trip started", {
			driverId: input.authId,
			userId: input.userId,
			tripId: input.tripId,
		});

		try {
			const driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.warn("Driver not found", { driverId: input.authId });
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

			await this.tripApiClient.completeTrip(input.authId, input.tripId);

			driver.state = DriverState.READY;

			const updatedDriver = await this.transactionManager.transaction(
				async (transaction) => {
					return await this.driverRepository.save(
						transaction,
						driver
					);
				}
			);

			const output = new CompleteTripUsecaseOutput(updatedDriver.state);

			logger.info("Completting trip completed", {
				driverId: input.authId,
				finalState: updatedDriver.state,
			});

			return output;
		} catch (err: any) {
			logger.error("Completting trip failed", {
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
