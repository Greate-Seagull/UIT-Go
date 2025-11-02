import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";

export class RejectTripUsecaseInput {
	driverId!: number;
	offerId!: number;
}

export class RejectTripUsecaseOutput {}

export class RejectTripUsecase {
	constructor(
		private readonly driverRepository: DriverRepository,
		private readonly tripApiClient: TripApiClient
	) {}

	async execute(input: RejectTripUsecaseInput) {
		const driver = await this.driverRepository.getById(input.driverId);
		if (!driver)
			throw Error(`Cannot find driver with id: ${input.driverId}`);

		console.log(
			`POST trip/offers/${input.offerId}/reject | data: { driverId: ${input.driverId} }`
		);
		const tripResult = await this.tripApiClient.reject(
			input.driverId,
			input.offerId
		);
		console.log(tripResult);

		let output = new RejectTripUsecaseOutput();

		return output;
	}
}
