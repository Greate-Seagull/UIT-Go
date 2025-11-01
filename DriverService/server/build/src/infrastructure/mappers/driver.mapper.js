"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverMapper = void 0;
const driver_entity_1 = require("../../domain/driver.entity");
class DriverMapper {
    static toDomain(raw) {
        if (!raw)
            return raw;
        let entity = driver_entity_1.Driver.create(Number(raw.id));
        entity.state = raw.state;
        return entity;
    }
}
exports.DriverMapper = DriverMapper;
//# sourceMappingURL=driver.mapper.js.map