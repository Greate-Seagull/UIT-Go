"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = exports.driverSchema = exports.DriverState = void 0;
const zod_1 = __importDefault(require("zod"));
var DriverState;
(function (DriverState) {
    DriverState["READY"] = "READY";
    DriverState["TRANSPORTING"] = "TRANSPORTING";
    DriverState["UNAVAILABLE"] = "UNAVAILABLE";
})(DriverState || (exports.DriverState = DriverState = {}));
exports.driverSchema = zod_1.default.object({
    id: zod_1.default.number().nullable().default(null),
    state: zod_1.default.string().default(DriverState.UNAVAILABLE),
    name: zod_1.default.string(),
    licensePlate: zod_1.default.string(),
});
class Driver {
    static create(input) {
        let parsedInput = exports.driverSchema.parse(input);
        // Business rules here
        return Object.assign(new Driver(), parsedInput);
    }
    static rehydrate(input) {
        if (!input)
            return null;
        const entity = new Driver();
        Object.assign(entity, input);
        return entity;
    }
}
exports.Driver = Driver;
//# sourceMappingURL=driver.entity.js.map