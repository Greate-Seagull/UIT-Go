"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptTripUsecase = exports.AcceptTripUsecaseOutput = exports.AcceptTripUsecaseInput = void 0;
const driver_entity_1 = require("../domain/entities/driver.entity");
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
class AcceptTripUsecaseInput {
    authId;
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
        pino_logger_1.logger.info("Accepting trip started", {
            driverId: input.authId,
            offerId: input.offerId,
        });
        try {
            const driver = await this.driverRepository.getById(input.authId);
            if (!driver) {
                pino_logger_1.logger.warn("Driver not found", {
                    driverId: input.authId,
                });
                throw Error(`Cannot find driver with id: ${input.authId}`);
            }
            if (driver.state !== driver_entity_1.DriverState.READY) {
                pino_logger_1.logger.warn("Driver not in READY state", {
                    driverId: input.authId,
                    state: driver.state,
                });
                throw Error(`The driver is not in ready state: ${driver.state}`);
            }
            const tripResult = await this.tripApiClient.assignDriver(input.authId, input.offerId);
            driver.state = driver_entity_1.DriverState.TRANSPORTING;
            const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
                return await this.driverRepository.save(transaction, driver);
            });
            let output = new AcceptTripUsecaseOutput(updatedDriver.state);
            pino_logger_1.logger.info("Accepting trip completed", {
                driverId: input.authId,
                finalState: updatedDriver.state,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("Accepting trip failed", {
                driverId: input.authId,
                offerId: input.offerId,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.AcceptTripUsecase = AcceptTripUsecase;
//# sourceMappingURL=accept-trip.usecase.js.map