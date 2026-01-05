"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartAcceptingUsecase = exports.StartAcceptingUsecaseOutput = exports.StartAcceptingUsecaseInput = void 0;
const driver_entity_1 = require("../domain/entities/driver.entity");
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
class StartAcceptingUsecaseInput {
    authId;
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
        pino_logger_1.logger.info("Start StartAcceptingUsecase.execute", {
            usecase: "StartAccepting",
            driverId: input.authId,
        });
        try {
            pino_logger_1.logger.debug("Fetching driver", {
                driverId: input.authId,
            });
            let driver = await this.driverRepository.getById(input.authId);
            if (!driver) {
                pino_logger_1.logger.error("Driver not found", {
                    driverId: input.authId,
                });
                throw Error(`Cannot find driver with id: ${input.authId}`);
            }
            pino_logger_1.logger.info("Updating driver state to READY", {
                driverId: input.authId,
                previousState: driver.state,
                newState: driver_entity_1.DriverState.READY,
            });
            driver.state = driver_entity_1.DriverState.READY;
            const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
                return await this.driverRepository.save(transaction, driver);
            });
            pino_logger_1.logger.debug("Driver state saved", {
                driverId: input.authId,
                finalState: updatedDriver.state,
            });
            let result = new StartAcceptingUsecaseOutput(updatedDriver.state);
            pino_logger_1.logger.info("StartAcceptingUsecase completed", {
                driverId: input.authId,
                finalState: result.state,
            });
            return result;
        }
        catch (err) {
            pino_logger_1.logger.error("StartAcceptingUsecase failed", {
                usecase: "StartAccepting",
                driverId: input.authId,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.StartAcceptingUsecase = StartAcceptingUsecase;
//# sourceMappingURL=start-accepting.usecase.js.map