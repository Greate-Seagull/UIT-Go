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
		logger.info("Starting accepting started", {
			driverId: input.authId,
		});

		try {
			let driver = await this.driverRepository.getById(input.authId);
			if (!driver) {
				logger.warn("Driver not found", {
					driverId: input.authId,
				});
				throw Error(`Cannot find driver with id: ${input.authId}`);
			}

			driver.state = DriverState.READY;

			const updatedDriver = await this.transactionManager.transaction(
				async (transaction) => {
					return await this.driverRepository.save(
						transaction,
						driver
					);
				}
			);

			let result = new StartAcceptingUsecaseOutput(updatedDriver.state);

			logger.info("Starting accepting completed", {
				driverId: input.authId,
				finalState: result.state,
			});

			return result;
		} catch (err: any) {
			logger.error("Starting accepting failed", {
				driverId: input.authId,
				error: err.message,
				stack: err.stack,
			});
			throw err;
		}
	}
}
