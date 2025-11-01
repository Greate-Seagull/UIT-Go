"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteTripUsecase = exports.CompleteTripUsecaseOutput = exports.CompleteTripUsecaseInput = void 0;
const driver_entity_1 = require("../domain/driver.entity");
class CompleteTripUsecaseInput {
    driverId;
    userId;
    tripId;
}
exports.CompleteTripUsecaseInput = CompleteTripUsecaseInput;
class CompleteTripUsecaseOutput {
    state;
    constructor(state) {
        this.state = state;
    }
}
exports.CompleteTripUsecaseOutput = CompleteTripUsecaseOutput;
class CompleteTripUsecase {
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
        if (driver.state != driver_entity_1.DriverState.TRANSPORTING)
            throw Error(`The driver is not in transporting state: ${driver.state}`);
        console.log(`POST /trips/${input.tripId}/complete`);
        await this.tripApiClient.completeTrip(input.driverId, input.tripId);
        driver.state = driver_entity_1.DriverState.READY;
        const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
            return await this.driverRepository.save(transaction, driver);
        });
        const output = new CompleteTripUsecaseOutput(updatedDriver.state);
        return output;
    }
}
exports.CompleteTripUsecase = CompleteTripUsecase;
//# sourceMappingURL=complete-trip.usecase.js.map