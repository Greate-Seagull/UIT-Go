import { DriverState } from "../domain/driver.entity";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";

export class StartAcceptingUsecaseInput {
	id!: number;
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
		let driver = await this.driverRepository.getById(input.id);
		if (!driver) throw Error(`Cannot find driver with id: ${input.id}`);

		driver.state = DriverState.READY;

		const updatedDriver = await this.transactionManager.transaction(
			async (transaction) => {
				return await this.driverRepository.save(transaction, driver);
			}
		);

		let result = new StartAcceptingUsecaseOutput(updatedDriver.state);
		return result;
	}
}
