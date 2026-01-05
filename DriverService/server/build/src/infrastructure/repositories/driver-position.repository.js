"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPositionRepository = void 0;
const driver_position_entity_1 = require("../../domain/entities/driver-position.entity");
const pino_logger_1 = require("../../infrastructure/logger/pino.logger");
const buildSqlQuery_1 = require("./buildSqlQuery");
class DriverPositionRepository {
    redis;
    static GEO_KEY = "driver_positions";
    constructor(redis) {
        this.redis = redis;
    }
    async getById(id) {
        pino_logger_1.logger.debug("Fetching driver position by ID", { id });
        let persistences = await this.redis.geopos(DriverPositionRepository.GEO_KEY, id);
        let persistence = persistences[0];
        if (!persistence) {
            pino_logger_1.logger.debug("Driver position not found", { id });
            return persistence;
        }
        let row = { id, long: persistence[0], lat: persistence[1] };
        const domain = driver_position_entity_1.DriverPosition.rehydrate(row);
        pino_logger_1.logger.debug("Driver position found", { id, domain });
        return domain;
    }
    async save(entity) {
        pino_logger_1.logger.debug("Saving driver position", { entity });
        const persistence = (0, buildSqlQuery_1.toPersistence)(entity);
        await this.redis.geoadd(DriverPositionRepository.GEO_KEY, persistence.long, persistence.lat, entity.id);
        const saved = await this.getById(entity.id);
        pino_logger_1.logger.info("Driver position saved", { id: entity.id, saved });
        return saved;
    }
    async expire(entity, expiryInMinute) {
        pino_logger_1.logger.debug("Setting expiry for driver position", {
            id: entity.id,
            expiryInMinute,
        });
        await this.redis.expire(entity.id, 60 * expiryInMinute);
        pino_logger_1.logger.info("Expiry set for driver position", { id: entity.id });
    }
    async find(lat, long, radiusMeters) {
        pino_logger_1.logger.debug("Finding drivers within radius", {
            lat,
            long,
            radiusMeters,
        });
        const results = await this.redis.georadius(DriverPositionRepository.GEO_KEY, long, lat, radiusMeters, "m", "WITHCOORD");
        const entities = results.map((result) => {
            let raw = { id: result[0], long: result[1][0], lat: result[1][1] };
            return driver_position_entity_1.DriverPosition.rehydrate(raw);
        });
        pino_logger_1.logger.info("Found drivers", { count: entities.length, entities });
        return entities;
    }
}
exports.DriverPositionRepository = DriverPositionRepository;
//# sourceMappingURL=driver-position.repository.js.map