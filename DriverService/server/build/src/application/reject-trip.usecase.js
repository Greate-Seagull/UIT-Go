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
        pino_logger_1.logger.info("Rejecting trip started", {
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
            const tripResult = await this.tripApiClient.reject(input.authId, input.offerId);
            const output = new RejectTripUsecaseOutput();
            pino_logger_1.logger.info("Rejecting trip completed", {
                driverId: input.authId,
                offerId: input.offerId,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("Rejecting trip failed", {
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