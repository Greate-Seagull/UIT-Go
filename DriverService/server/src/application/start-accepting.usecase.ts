import { DriverState } from "../domain/entities/driver.entity";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
import { logger } from "../infrastructure/logger/pino.logger";

export class StartAcceptingUsecaseInput {
	authId!: number;
}

export class StartAcceptingUsecaseOutput {
	constructor(public state: DriverState) {}
}

export class StartAcceptingUsecase {
	constructor(
		private driverRepository: DriverRepository,
		private transactionManager: TransactionManager
	) {}

	async execute(
		input: StartAcceptingUsecaseInput
	): Promise<StartAcceptingUsecaseOutput> {
		logger.info("Start StartAcceptingUsecase.execute", {
			usecase: "StartAccepting",
			driverId: input.authId,
		});

		try {
			logger.debug("Fetching driver", {
				driverId: input.authId,
			});

			let driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.error("Driver not found", {
					driverId: input.authId,
				});
				throw Error(`Cannot find driver with id: ${input.authId}`);
			}

			logger.info("Updating driver state to READY", {
				driverId: input.authId,
				previousState: driver.state,
				newState: DriverState.READY,
			});

			driver.state = DriverState.READY;

			const updatedDriver = await this.transactionManager.transaction(
				async (transaction) => {
					return await this.driverRepository.save(
						transaction,
						driver
					);
				}
			);

			logger.debug("Driver state saved", {
				driverId: input.authId,
				finalState: updatedDriver.state,
			});

			let result = new StartAcceptingUsecaseOutput(updatedDriver.state);

			logger.info("StartAcceptingUsecase completed", {
				driverId: input.authId,
				finalState: result.state,
			});

			return result;
		} catch (err: any) {
			logger.error("StartAcceptingUsecase failed", {
				usecase: "StartAccepting",
				driverId: input.authId,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
