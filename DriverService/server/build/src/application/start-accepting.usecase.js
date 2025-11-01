"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartAcceptingUsecase = exports.StartAcceptingUsecaseOutput = exports.StartAcceptingUsecaseInput = void 0;
const driver_entity_1 = require("../domain/driver.entity");
class StartAcceptingUsecaseInput {
    id;
}
exports.StartAcceptingUsecaseInput = StartAcceptingUsecaseInput;
class StartAcceptingUsecaseOutput {
    state;
    constructor(state) {
        this.state = state;
    }
}
exports.StartAcceptingUsecaseOutput = StartAcceptingUsecaseOutput;
class StartAcceptingUsecase {
    driverRepository;
    transactionManager;
    constructor(driverRepository, transactionManager) {
        this.driverRepository = driverRepository;
        this.transactionManager = transactionManager;
    }
    async execute(input) {
        let driver = await this.driverRepository.getById(input.id);
        if (!driver)
            throw Error(`Cannot find driver with id: ${input.id}`);
        driver.state = driver_entity_1.DriverState.READY;
        const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
            return await this.driverRepository.save(transaction, driver);
        });
        let result = new StartAcceptingUsecaseOutput(updatedDriver.state);
        return result;
    }
}
exports.StartAcceptingUsecase = StartAcceptingUsecase;
//# sourceMappingURL=start-accepting.usecase.js.map