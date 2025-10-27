import { DriverRepository } from "../infrastructure/repositories/driver.repository";

export class StartAcceptingUsecaseInput {
	id!: number;
	state!: string;
}

export class StartAcceptingUsecase {
	constructor(private driverRepository: DriverRepository) {}

	async execute(input: StartAcceptingUsecaseInput) {
		console.log("usecase ", input);
		let driver = await this.driverRepository.getById(input.id);
		console.log(driver);
	}
}
