"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = exports.authenticationTokenSchema = exports.PasswordService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
class PasswordService {
    saltRound;
    constructor(saltRound) {
        this.saltRound = saltRound;
    }
    generateSalt() {
        return bcrypt_1.default.genSaltSync(this.saltRound);
    }
    hashPassword(barePassword, salt) {
        return bcrypt_1.default.hashSync(barePassword, salt);
    }
    comparePassword(barePassword, hashedPassword) {
        return bcrypt_1.default.compareSync(barePassword, hashedPassword);
    }
}
exports.PasswordService = PasswordService;
exports.authenticationTokenSchema = zod_1.z.object({
    id: zod_1.z.number(),
});
class TokenService {
    secret;
    expiry;
    constructor(secret, expiry) {
        this.secret = secret;
        this.expiry = expiry;
    }
    generateJwt(payload) {
        const options = { expiresIn: this.expiry };
        return jsonwebtoken_1.default.sign(payload, this.secret, options);
    }
    verifyJwt(token) {
        return jsonwebtoken_1.default.verify(token, this.secret);
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=encrypt.service.js.map