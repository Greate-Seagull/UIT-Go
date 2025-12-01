import { DriverState } from "../domain/driver.entity";
import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";

export class AcceptTripUsecaseInput {
	driverId!: number;
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
		const driver = await this.driverRepository.getById(input.driverId);
		if (!driver)
			throw Error(`Cannot find driver with id: ${input.driverId}`);

		if (driver.state != DriverState.READY)
			throw Error(`The driver is not in ready state: ${driver.state}`);

		const tripResult = await this.tripApiClient.assignDriver(
			input.driverId,
			input.offerId
		);

		driver.state = DriverState.TRANSPORTING;

		const updatedDriver = await this.transactionManager.transaction(
			async (transaction) => {
				return await this.driverRepository.save(transaction, driver);
			}
		);

		let output = new AcceptTripUsecaseOutput(updatedDriver.state);

		return output;
	}
}
