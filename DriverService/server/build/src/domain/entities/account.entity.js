"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = exports.accountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.accountSchema = zod_1.default.object({
    id: zod_1.default.number().nullable().default(null),
    username: zod_1.default.string(),
    password: zod_1.default.string(),
    salt: zod_1.default.string(),
    driverId: zod_1.default.number(),
});
class Account {
    static create(input) {
        let parsedInput = exports.accountSchema.parse(input);
        // Business rules here
        return Object.assign(new Account(), parsedInput);
    }
    static rehydrate(input) {
        if (!input)
            return null;
        const entity = new Account();
        Object.assign(entity, input);
        return entity;
    }
}
exports.Account = Account;
//# sourceMappingURL=account.entity.js.map