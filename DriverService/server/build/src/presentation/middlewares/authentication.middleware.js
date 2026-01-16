"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bearerTokenHeaderSchema = void 0;
exports.authenticationMiddleware = authenticationMiddleware;
const zod_1 = __importDefault(require("zod"));
const composition_root_1 = require("../../composition-root");
const encrypt_service_1 = require("../../domain/service/encrypt.service");
const pino_logger_1 = require("../../infrastructure/logger/pino.logger");
exports.bearerTokenHeaderSchema = zod_1.default
    .string()
    .regex(/^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/, "Invalid Bearer token format")
    .transform((val) => {
    const [, token] = val.split(" ");
    return token;
});
function authenticationMiddleware(req, res, next) {
    pino_logger_1.logger.info("AuthenticationMiddleware: Start", {
        path: req.path,
        method: req.method,
    });
    try {
        pino_logger_1.logger.debug("AuthenticationMiddleware: Checking Authorization header");
        const result = authenticate(req.headers.authorization);
        req.authId = result.id;
        pino_logger_1.logger.info("AuthenticationMiddleware: Authenticated", {
            userId: result.id,
        });
        next();
    }
    catch (e) {
        pino_logger_1.logger.warn("AuthenticationMiddleware: Unauthorized request", {
            path: req.path,
            method: req.method,
            error: e.message,
        });
        res.status(401).jsend.fail("Unauthenticated");
    }
}
function authenticate(header) {
    const authHeader = exports.bearerTokenHeaderSchema.parse(header);
    const decoded = composition_root_1.tokenService.verifyJwt(authHeader);
    const result = encrypt_service_1.authenticationTokenSchema.parse(decoded);
    return result;
}
//# sourceMappingURL=authentication.middleware.js.map