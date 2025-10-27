import { DriverState } from "../domain/driver.entity";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";

export class StartAcceptingUsecaseInput {
	id!: number;
	state!: string;
}

export class StartAcceptingUsecaseOutput {
	constructor(public state: DriverState) {}
}

export class StartAcceptingUsecase {
	constructor(private driverRepository: DriverRepository) {}

	async execute(
		input: StartAcceptingUsecaseInput
	): Promise<StartAcceptingUsecaseOutput> {
		if (input.state != "ready")
			throw Error(`Expect driver state: ${DriverState.READY}`);

		let driver = await this.driverRepository.getById(input.id);
		if (!driver) throw Error(`Cannot find driver with id: ${input.id}`);

		driver.state = DriverState.READY;

		const updatedDriver = await this.driverRepository.save(driver);

		let result = new StartAcceptingUsecaseOutput(updatedDriver.state);
		return result;
	}
}
