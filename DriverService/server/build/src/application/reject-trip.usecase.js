"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectTripUsecase = exports.RejectTripUsecaseOutput = exports.RejectTripUsecaseInput = void 0;
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
class RejectTripUsecaseInput {
    authId;
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
        pino_logger_1.logger.info("Start RejectTripUsecase.execute", {
            usecase: "RejectTrip",
            driverId: input.authId,
            offerId: input.offerId,
        });
        try {
            pino_logger_1.logger.debug("Fetching driver", {
                driverId: input.authId,
            });
            const driver = await this.driverRepository.getById(input.authId);
            if (!driver) {
                pino_logger_1.logger.error("Driver not found", {
                    driverId: input.authId,
                });
                throw Error(`Cannot find driver with id: ${input.authId}`);
            }
            pino_logger_1.logger.info("Calling Trip API to reject offer", {
                driverId: input.authId,
                offerId: input.offerId,
            });
            const tripResult = await this.tripApiClient.reject(input.authId, input.offerId);
            pino_logger_1.logger.debug("Trip offer rejected successfully", {
                driverId: input.authId,
                offerId: input.offerId,
                tripResult,
            });
            const output = new RejectTripUsecaseOutput();
            pino_logger_1.logger.info("RejectTripUsecase completed", {
                driverId: input.authId,
                offerId: input.offerId,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("RejectTripUsecase failed", {
                usecase: "RejectTrip",
                driverId: input.authId,
                offerId: input.offerId,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.RejectTripUsecase = RejectTripUsecase;
//# sourceMappingURL=reject-trip.usecase.js.map