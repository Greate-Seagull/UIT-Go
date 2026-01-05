"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchDriverUsecase = exports.SearchDriverUsecaseOutput = exports.SearchDriverUsecaseInput = void 0;
const pino_logger_1 = require("../infrastructure/logger/pino.logger");
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
        pino_logger_1.logger.info("Start SearchDriverUsecase.execute", {
            usecase: "SearchDriver",
            lat: input.lat,
            lng: input.lng,
            radiusMeters: input.radiusMeters,
            limit: input.limit,
        });
        try {
            // Validation
            if (input.radiusMeters < 0) {
                pino_logger_1.logger.warn("Invalid radiusMeters", {
                    radiusMeters: input.radiusMeters,
                });
                throw Error(`Expect a positive radius meter but got: ${input.radiusMeters}`);
            }
            if (input.limit < 0) {
                pino_logger_1.logger.warn("Invalid limit", { limit: input.limit });
                throw Error(`Expect a positive limit but got: ${input.limit}`);
            }
            pino_logger_1.logger.debug("Searching drivers in radius", {
                lat: input.lat,
                lng: input.lng,
                radiusMeters: input.radiusMeters,
            });
            const driverPositions = await this.driverPositionRepository.find(input.lat, input.lng, input.radiusMeters);
            pino_logger_1.logger.debug("Drivers found", {
                count: driverPositions.length,
            });
            const output = driverPositions.map((driverPos) => new SearchDriverUsecaseOutput(driverPos.id, driverPos.lat, driverPos.long));
            pino_logger_1.logger.info("SearchDriverUsecase completed", {
                requestLat: input.lat,
                requestLng: input.lng,
                resultCount: output.length,
            });
            return output;
        }
        catch (err) {
            pino_logger_1.logger.error("SearchDriverUsecase failed", {
                usecase: "SearchDriver",
                lat: input.lat,
                lng: input.lng,
                radiusMeters: input.radiusMeters,
                limit: input.limit,
                error: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }
}
exports.SearchDriverUsecase = SearchDriverUsecase;
//# sourceMappingURL=search-driver.usecase.js.map