import { AxiosInstance } from "axios";

export class TripApiClient {
	constructor(private readonly axios: AxiosInstance) {}

	async assignDriver(driverId: number, tripId: number) {
		console.log("enter tripApiClient");
		return await this.axios.post(
			`/trip/offers/${tripId}/accept`,
			{},
			{
				headers: {
					"X-Driver-Id": String(driverId),
				},
			}
		);
	}
}
