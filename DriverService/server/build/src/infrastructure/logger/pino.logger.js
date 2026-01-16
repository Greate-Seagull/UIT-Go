"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.PinoLogger = void 0;
const pino_1 = __importDefault(require("pino"));
class PinoLogger {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    debug(message, context) {
        this.logger.debug(context ?? {}, message);
    }
    info(message, context) {
        this.logger.info(context ?? {}, message);
    }
    warn(message, context) {
        this.logger.warn(context ?? {}, message);
    }
    error(message, context) {
        this.logger.error(context ?? {}, message);
    }
}
exports.PinoLogger = PinoLogger;
exports.logger = new PinoLogger((0, pino_1.default)({
    level: "debug",
    transport: {
        target: "pino-pretty",
        options: { colorize: true },
    },
}));
//# sourceMappingURL=pino.logger.js.map