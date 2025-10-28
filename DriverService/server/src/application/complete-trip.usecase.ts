import { driverPositionInput } from "../../tests/integration/update-position/update-position.test-data";
import { DriverState } from "../domain/driver.entity";
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

		console.log(
			`PUT /api/trips/${input.tripId}/complete | data: { driverId: ${input.driverId}, userId: ${input.userId} }`
		);

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
