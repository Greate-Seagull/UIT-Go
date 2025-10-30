"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePositionUsecase = exports.UpdatePositionUsecaseOutput = exports.UpdatePositionUsecaseInput = void 0;
const driver_position_entity_1 = require("../domain/driver-position.entity");
class UpdatePositionUsecaseInput {
    driverId;
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
        // let driverPosition = await this.driverPositionRepository.getById(
        // 	input.driverId
        // );
        // if (!driverPosition)
        // 	driverPosition = DriverPosition.create(input.driverId);
        let driverPosition = driver_position_entity_1.DriverPosition.create(input.driverId);
        driverPosition.lat = input.lat;
        driverPosition.long = input.long;
        const updated = await this.driverPositionRepository.save(driverPosition);
        await this.driverPositionRepository.expire(updated, 5);
        let output = new UpdatePositionUsecaseOutput(updated.lat, updated.long);
        return output;
    }
}
exports.UpdatePositionUsecase = UpdatePositionUsecase;
//# sourceMappingURL=update-position.usecase.js.map