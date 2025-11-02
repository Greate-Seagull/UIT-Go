"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectTripUsecase = exports.RejectTripUsecaseOutput = exports.RejectTripUsecaseInput = void 0;
class RejectTripUsecaseInput {
    driverId;
    offerId;
}
exports.RejectTripUsecaseInput = RejectTripUsecaseInput;
class RejectTripUsecaseOutput {
}
exports.RejectTripUsecaseOutput = RejectTripUsecaseOutput;
class RejectTripUsecase {
    driverRepository;
    tripApiClient;
    constructor(driverRepository, tripApiClient) {
        this.driverRepository = driverRepository;
        this.tripApiClient = tripApiClient;
    }
    async execute(input) {
        const driver = await this.driverRepository.getById(input.driverId);
        if (!driver)
            throw Error(`Cannot find driver with id: ${input.driverId}`);
        const tripResult = await this.tripApiClient.reject(input.driverId, input.offerId);
        let output = new RejectTripUsecaseOutput();
        return output;
    }
}
exports.RejectTripUsecase = RejectTripUsecase;
//# sourceMappingURL=reject-trip.usecase.js.map