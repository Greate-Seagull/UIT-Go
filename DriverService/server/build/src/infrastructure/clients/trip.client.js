"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripApiClient = void 0;
class TripApiClient {
    axios;
    constructor(axios) {
        this.axios = axios;
    }
    async assignDriver(driverId, tripId) {
        return await this.axios.post(`/trip/offers/${tripId}/accept`, {}, {
            headers: {
                "X-Driver-Id": String(driverId),
            },
        });
    }
    async completeTrip(driverId, tripId) {
        return await this.axios.post(`/trips/${tripId}/complete`, {}, {
            headers: {
                "X-Driver-Id": String(driverId),
            },
        });
    }
}
exports.TripApiClient = TripApiClient;
//# sourceMappingURL=trip.client.js.map