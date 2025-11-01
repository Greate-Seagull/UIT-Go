"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDriverUsecase = exports.SearchDriverUsecaseOutput = exports.SearchDriverUsecaseInput = void 0;
class SearchDriverUsecaseInput {
    lat;
    lng;
    radiusMeters;
    limit;
}
exports.SearchDriverUsecaseInput = SearchDriverUsecaseInput;
class SearchDriverUsecaseOutput {
    driverId;
    lat;
    long;
    constructor(driverId, lat, long) {
        this.driverId = driverId;
        this.lat = lat;
        this.long = long;
    }
}
exports.SearchDriverUsecaseOutput = SearchDriverUsecaseOutput;
class SearchDriverUsecase {
    driverPositionRepository;
    constructor(driverPositionRepository) {
        this.driverPositionRepository = driverPositionRepository;
    }
    async execute(input) {
        if (input.radiusMeters < 0)
            throw Error(`Expect a positive radius metter but got: ${input.radiusMeters}`);
        if (input.limit < 0)
            throw Error(`Expect a positive limit but got: ${input.limit}`);
        const driverPositions = await this.driverPositionRepository.find(input.lat, input.lng, input.radiusMeters);
        const output = driverPositions.map((driverPos) => new SearchDriverUsecaseOutput(driverPos.id, driverPos.lat, driverPos.long));
        return output;
    }
}
exports.SearchDriverUsecase = SearchDriverUsecase;
//# sourceMappingURL=search-driver.usecase.js.map