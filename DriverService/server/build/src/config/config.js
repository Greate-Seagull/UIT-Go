"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
exports.config = {
    redis: {
        REDIS_HOST: String(process.env.REDIS_HOST),
        REDIS_PORT: Number(process.env.REDIS_PORT),
    },
};
//# sourceMappingURL=config.js.map