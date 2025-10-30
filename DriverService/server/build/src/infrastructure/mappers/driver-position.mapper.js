"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPositionMapper = void 0;
const driver_position_entity_1 = require("../../domain/driver-position.entity");
class DriverPositionMapper {
    static toDomain(raw) {
        if (!raw)
            return raw;
        let entity = driver_position_entity_1.DriverPosition.create(Number(raw.id));
        entity.lat = Number(raw.lat);
        entity.long = Number(raw.long);
        return entity;
    }
    static toPersistent(entity) {
        return {
            lat: entity.lat,
            long: entity.long,
        };
    }
}
exports.DriverPositionMapper = DriverPositionMapper;
//# sourceMappingURL=driver-position.mapper.js.map