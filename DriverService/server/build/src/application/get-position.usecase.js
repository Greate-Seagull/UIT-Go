"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPositionUsecase = exports.GetPositionUsecaseOutput = exports.GetPositionUsecaseInput = void 0;
class GetPositionUsecaseInput {
    driverId;
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
        const driverPosition = await this.driverPositionRepository.getById(input.driverId);
        if (!driverPosition)
            throw Error("Driver doesn't exist or not in ready state");
        let output = new GetPositionUsecaseOutput(driverPosition.lat, driverPosition.long);
        return output;
    }
}
exports.GetPositionUsecase = GetPositionUsecase;
//# sourceMappingURL=get-position.usecase.js.map