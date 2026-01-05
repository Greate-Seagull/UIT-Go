"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverPositionData = exports.queryInput = void 0;
const driver_position_entity_1 = require("../../../src/domain/entities/driver-position.entity");
exports.queryInput = {
    lat: 1,
    lng: 1,
    radiusMeters: 3000,
    limit: 10,
};
exports.driverPositionData = driver_position_entity_1.DriverPosition.create(5);
exports.driverPositionData.lat = 1.004;
exports.driverPositionData.long = 1.002;
//# sourceMappingURL=search-driver.test-data.js.map