"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptTripUsecase = exports.AcceptTripUsecaseOutput = exports.AcceptTripUsecaseInput = void 0;
const driver_entity_1 = require("../domain/driver.entity");
class AcceptTripUsecaseInput {
    driverId;
    offerId;
}
exports.AcceptTripUsecaseInput = AcceptTripUsecaseInput;
class AcceptTripUsecaseOutput {
    state;
    constructor(state) {
        this.state = state;
    }
}
exports.AcceptTripUsecaseOutput = AcceptTripUsecaseOutput;
class AcceptTripUsecase {
    driverRepository;
    tripApiClient;
    transactionManager;
    constructor(driverRepository, tripApiClient, transactionManager) {
        this.driverRepository = driverRepository;
        this.tripApiClient = tripApiClient;
        this.transactionManager = transactionManager;
    }
    async execute(input) {
        const driver = await this.driverRepository.getById(input.driverId);
        if (!driver)
            throw Error(`Cannot find driver with id: ${input.driverId}`);
        if (driver.state != driver_entity_1.DriverState.READY)
            throw Error(`The driver is not in ready state: ${driver.state}`);
        console.log(`POST /api/trips/${input.offerId}/assign | data: { driverId: ${input.driverId} }`);
        const tripResult = await this.tripApiClient.assignDriver(input.driverId, input.offerId);
        console.log(tripResult);
        driver.state = driver_entity_1.DriverState.TRANSPORTING;
        const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
            return await this.driverRepository.save(transaction, driver);
        });
        let output = new AcceptTripUsecaseOutput(updatedDriver.state);
        return output;
    }
}
exports.AcceptTripUsecase = AcceptTripUsecase;
//# sourceMappingURL=accept-trip.usecase.js.map