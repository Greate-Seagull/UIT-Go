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
    transactionManager;
    constructor(driverRepository, transactionManager) {
        this.driverRepository = driverRepository;
        this.transactionManager = transactionManager;
    }
    async execute(input) {
        const driver = await this.driverRepository.getById(input.driverId);
        if (!driver)
            throw Error(`Cannot find driver with id: ${input.driverId}`);
        if (driver.state != driver_entity_1.DriverState.TRANSPORTING)
            throw Error(`The driver is not in transporting state: ${driver.state}`);
        console.log(`PUT /api/trips/${input.tripId}/complete | data: { driverId: ${input.driverId}, userId: ${input.userId} }`);
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