import { DriverState } from "../domain/driver.entity";
import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";

export class CompleteTripUsecaseInput {
	driverId!: number;
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
		const driver = await this.driverRepository.getById(input.driverId);
		if (!driver)
			throw Error(`Cannot find driver with id: ${input.driverId}`);
		if (driver.state != DriverState.TRANSPORTING)
			throw Error(
				`The driver is not in transporting state: ${driver.state}`
			);

		await this.tripApiClient.completeTrip(input.driverId, input.tripId);

		driver.state = DriverState.READY;

		const updatedDriver = await this.transactionManager.transaction(
			async (transaction) => {
				return await this.driverRepository.save(transaction, driver);
			}
		);

		const output = new CompleteTripUsecaseOutput(updatedDriver.state);
		return output;
	}
}
