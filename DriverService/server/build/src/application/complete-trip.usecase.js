"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteTripUsecase = exports.CompleteTripUsecaseOutput = exports.CompleteTripUsecaseInput = void 0;
const driver_entity_1 = require("../domain/entities/driver.entity");
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
class CompleteTripUsecaseInput {
    authId;
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
        pino_logger_1.logger.info("Completting trip started", {
            driverId: input.authId,
            userId: input.userId,
            tripId: input.tripId,
        });
        try {
            const driver = await this.driverRepository.getById(input.authId);
            if (!driver) {
                pino_logger_1.logger.warn("Driver not found", { driverId: input.authId });
                throw Error(`Cannot find driver with id: ${input.authId}`);
            }
            if (driver.state !== driver_entity_1.DriverState.TRANSPORTING) {
                pino_logger_1.logger.warn("Driver not in TRANSPORTING state", {
                    driverId: input.authId,
                    state: driver.state,
                });
                throw Error(`The driver is not in transporting state: ${driver.state}`);
            }
            await this.tripApiClient.completeTrip(input.authId, input.tripId);
            driver.state = driver_entity_1.DriverState.READY;
            const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
                return await this.driverRepository.save(transaction, driver);
            });
            const output = new CompleteTripUsecaseOutput(updatedDriver.state);
            pino_logger_1.logger.info("Completting trip completed", {
                driverId: input.authId,
                finalState: updatedDriver.state,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("Completting trip failed", {
                driverId: input.authId,
                userId: input.userId,
                tripId: input.tripId,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.CompleteTripUsecase = CompleteTripUsecase;
//# sourceMappingURL=complete-trip.usecase.js.map