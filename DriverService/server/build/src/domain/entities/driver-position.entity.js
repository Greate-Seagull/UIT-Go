"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPosition = exports.driverPositionSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.driverPositionSchema = zod_1.default.object({
    id: zod_1.default.number().nullable().default(null),
    lat: zod_1.default.number(),
    long: zod_1.default.number(),
});
class DriverPosition {
    static create(input) {
        let parsedInput = exports.driverPositionSchema.parse(input);
        // Business rules here
        return Object.assign(new DriverPosition(), parsedInput);
    }
    static rehydrate(input) {
        if (!input)
            return null;
        const entity = new DriverPosition();
        Object.assign(entity, input);
        return entity;
    }
}
exports.DriverPosition = DriverPosition;
//# sourceMappingURL=driver-position.entity.js.map