"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPositionRepository = void 0;
const driver_position_mapper_1 = require("../mappers/driver-position.mapper");
class DriverPositionRepository {
    redis;
    static GEO_KEY = "driver_positions";
    constructor(redis) {
        this.redis = redis;
    }
    async getById(id) {
        let persistences = await this.redis.geopos(DriverPositionRepository.GEO_KEY, id);
        let persistence = persistences[0];
        if (!persistence)
            return persistence;
        let row = {
            id: id,
            long: persistence[0],
            lat: persistence[1],
        };
        return driver_position_mapper_1.DriverPositionMapper.toDomain(row);
    }
    async save(entity) {
        const persistence = driver_position_mapper_1.DriverPositionMapper.toPersistent(entity);
        await this.redis.geoadd(DriverPositionRepository.GEO_KEY, persistence.long, persistence.lat, persistence.id);
        return this.getById(entity.id);
    }
    async expire(entity, expiryInMinute) {
        await this.redis.expire(entity.id, 60 * expiryInMinute);
    }
    async find(lat, long, radiusMeters) {
        const results = await this.redis.georadius(DriverPositionRepository.GEO_KEY, long, lat, radiusMeters, "m", "WITHCOORD");
        const entities = results.map((result) => {
            let raw = { id: result[0], long: result[1][0], lat: result[1][1] };
            return driver_position_mapper_1.DriverPositionMapper.toDomain(raw);
        });
        return entities;
    }
}
exports.DriverPositionRepository = DriverPositionRepository;
//# sourceMappingURL=driver-position.repository.js.map