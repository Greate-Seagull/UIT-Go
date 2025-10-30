"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPositionRepository = void 0;
const driver_position_mapper_1 = require("../mappers/driver-position.mapper");
class DriverPositionRepository {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async getById(id) {
        let row = await this.redis.hgetall(id);
        row.id = id;
        return driver_position_mapper_1.DriverPositionMapper.toDomain(row);
    }
    async save(entity) {
        await this.redis.hmset(entity.id, driver_position_mapper_1.DriverPositionMapper.toPersistent(entity));
        return this.getById(entity.id);
    }
    async expire(entity, expiryInMinute) {
        await this.redis.expire(entity.id, 60 * expiryInMinute);
    }
}
exports.DriverPositionRepository = DriverPositionRepository;
//# sourceMappingURL=driver-position.repository.js.map