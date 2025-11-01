"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
exports.config = {
    redis: {
        REDIS_HOST: String(process.env.REDIS_HOST),
        REDIS_PORT: Number(process.env.REDIS_PORT),
    },
    tripApi: {
        TRIP_SERVICE_URL: String(process.env.TRIP_SERVICE_URL),
    },
};
//# sourceMappingURL=config.js.map