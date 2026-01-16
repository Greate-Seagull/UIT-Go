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
        pino_logger_1.logger.info("Updating position started", {
            driverId: input.id,
        });
        try {
            let driverPosition = driver_position_entity_1.DriverPosition.create(input);
            const updated = await this.driverPositionRepository.save(driverPosition);
            await this.driverPositionRepository.expire(updated, 5);
            const output = new UpdatePositionUsecaseOutput(updated.lat, updated.long);
            pino_logger_1.logger.info("Updating position completed", {
                driverId: input.id,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("Updating position failed", {
                driverId: input.id,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.UpdatePositionUsecase = UpdatePositionUsecase;
//# sourceMappingURL=update-position.usecase.js.map