import { AxiosInstance } from "axios";

export class TripApiClient {
	constructor(private readonly axios: AxiosInstance) {}

	async assignDriver(driverId: number, offerId: number) {
		return await this.axios.post(
			`/trip/offers/${offerId}/accept`,
			{},
			{
				headers: {
					"X-Driver-Id": String(driverId),
				},
			}
		);
	}

	async completeTrip(driverId: number, tripId: number) {
		return await this.axios.post(
			`/trips/${tripId}/complete`,
			{},
			{
				headers: {
					"X-Driver-Id": String(driverId),
				},
			}
		);
	}
}
