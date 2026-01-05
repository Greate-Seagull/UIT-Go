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
        pino_logger_1.logger.info("Start AcceptTripUsecase.execute", {
            usecase: "AcceptTrip",
            driverId: input.authId,
            offerId: input.offerId,
        });
        try {
            pino_logger_1.logger.debug("Fetching driver", { driverId: input.authId });
            const driver = await this.driverRepository.getById(input.authId);
            if (!driver) {
                pino_logger_1.logger.error("Driver not found", {
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
            pino_logger_1.logger.info("Calling trip service to assign driver", {
                driverId: input.authId,
                offerId: input.offerId,
            });
            const tripResult = await this.tripApiClient.assignDriver(input.authId, input.offerId);
            pino_logger_1.logger.debug("Trip service assigned successfully", {
                driverId: input.authId,
                offerId: input.offerId,
                tripResult,
            });
            driver.state = driver_entity_1.DriverState.TRANSPORTING;
            pino_logger_1.logger.info("Saving updated driver state", {
                driverId: input.authId,
                newState: driver.state,
            });
            const updatedDriver = await this.transactionManager.transaction(async (transaction) => {
                return await this.driverRepository.save(transaction, driver);
            });
            let output = new AcceptTripUsecaseOutput(updatedDriver.state);
            pino_logger_1.logger.info("AcceptTripUsecase completed", {
                driverId: input.authId,
                finalState: updatedDriver.state,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("AcceptTripUsecase failed", {
                usecase: "AcceptTrip",
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