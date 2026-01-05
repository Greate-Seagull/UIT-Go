"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePositionUsecase = exports.UpdatePositionUsecaseOutput = exports.UpdatePositionUsecaseInput = void 0;
const driver_position_entity_1 = require("../domain/entities/driver-position.entity");
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
class UpdatePositionUsecaseInput {
    id;
    lat;
    long;
}
exports.UpdatePositionUsecaseInput = UpdatePositionUsecaseInput;
class UpdatePositionUsecaseOutput {
    lat;
    long;
    constructor(lat, long) {
        this.lat = lat;
        this.long = long;
    }
}
exports.UpdatePositionUsecaseOutput = UpdatePositionUsecaseOutput;
class UpdatePositionUsecase {
    driverPositionRepository;
    constructor(driverPositionRepository) {
        this.driverPositionRepository = driverPositionRepository;
    }
    async execute(input) {
        pino_logger_1.logger.info("Start UpdatePositionUsecase.execute", {
            usecase: "UpdatePosition",
            driverId: input.id,
            lat: input.lat,
            long: input.long,
        });
        try {
            pino_logger_1.logger.debug("Creating/updating driver position", {
                driverId: input.id,
                lat: input.lat,
                long: input.long,
            });
            let driverPosition = driver_position_entity_1.DriverPosition.create(input);
            const updated = await this.driverPositionRepository.save(driverPosition);
            pino_logger_1.logger.debug("Driver position saved", {
                driverId: input.id,
                lat: updated.lat,
                long: updated.long,
            });
            await this.driverPositionRepository.expire(updated, 5);
            pino_logger_1.logger.debug("Driver position expiration set", {
                driverId: input.id,
                ttlMinutes: 5,
            });
            const output = new UpdatePositionUsecaseOutput(updated.lat, updated.long);
            pino_logger_1.logger.info("UpdatePositionUsecase completed", {
                driverId: input.id,
                lat: output.lat,
                long: output.long,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("UpdatePositionUsecase failed", {
                usecase: "UpdatePosition",
                driverId: input.id,
                lat: input.lat,
                long: input.long,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.UpdatePositionUsecase = UpdatePositionUsecase;
//# sourceMappingURL=update-position.usecase.js.map