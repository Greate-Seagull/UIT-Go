"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptTripUsecase = exports.AcceptTripUsecaseOutput = exports.AcceptTripUsecaseInput = void 0;
const driver_entity_1 = require("../domain/driver.entity");
class AcceptTripUsecaseInput {
    driverId;
    tripId;
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
    transactionManager;
    constructor(driverRepository, transactionManager) {
        this.driverRepository = driverRepository;
        this.transactionManager = transactionManager;
    }
    async execute(input) {
        const driver = await this.driverRepository.getById(input.driverId);
        if (!driver)
            throw Error(`Cannot find driver with id: ${input.driverId}`);
        if (driver.state != driver_entity_1.DriverState.READY)
            throw Error(`The driver is not in ready state: ${driver.state}`);
        console.log(`PUT /api/trips/${input.tripId}/assign | data: { driverId: ${input.driverId} }`);
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