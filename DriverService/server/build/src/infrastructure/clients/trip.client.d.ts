import { AxiosInstance } from "axios";
export declare class TripApiClient {
    private readonly axios;
    constructor(axios: AxiosInstance);
    assignDriver(driverId: number, tripId: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
    completeTrip(driverId: number, tripId: number): Promise<import("axios").AxiosResponse<any, any, {}>>;
}
//# sourceMappingURL=trip.client.d.ts.map