"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPositionUsecase = exports.GetPositionUsecaseOutput = exports.GetPositionUsecaseInput = void 0;
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
class GetPositionUsecaseInput {
    id;
}
exports.GetPositionUsecaseInput = GetPositionUsecaseInput;
class GetPositionUsecaseOutput {
    lat;
    long;
    constructor(lat, long) {
        this.lat = lat;
        this.long = long;
    }
}
exports.GetPositionUsecaseOutput = GetPositionUsecaseOutput;
class GetPositionUsecase {
    driverPositionRepository;
    constructor(driverPositionRepository) {
        this.driverPositionRepository = driverPositionRepository;
    }
    async execute(input) {
        pino_logger_1.logger.info("Start GetPositionUsecase.execute", {
            usecase: "GetPosition",
            driverId: input.id,
        });
        try {
            pino_logger_1.logger.debug("Fetching driver position", {
                driverId: input.id,
            });
            const driverPosition = await this.driverPositionRepository.getById(input.id);
            if (!driverPosition) {
                pino_logger_1.logger.warn("Driver position not found", {
                    driverId: input.id,
                });
                throw Error("Driver doesn't exist or not in ready state");
            }
            pino_logger_1.logger.debug("Driver position retrieved", {
                driverId: input.id,
                lat: driverPosition.lat,
                long: driverPosition.long,
            });
            const output = new GetPositionUsecaseOutput(driverPosition.lat, driverPosition.long);
            pino_logger_1.logger.info("GetPositionUsecase completed", {
                driverId: input.id,
                lat: output.lat,
                long: output.long,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("GetPositionUsecase failed", {
                usecase: "GetPosition",
                driverId: input.id,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.GetPositionUsecase = GetPositionUsecase;
//# sourceMappingURL=get-position.usecase.js.map