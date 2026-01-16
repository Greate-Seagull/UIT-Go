"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
const composition_root_1 = require("../../composition-root");
async function healthCheck(req, res) {
    const health = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        dbPool: {
            total: composition_root_1.pool.totalCount,
            idle: composition_root_1.pool.idleCount,
            waiting: composition_root_1.pool.waitingCount,
        },
        memory: process.memoryUsage(),
    };
    res.jsend.success(health);
}
//# sourceMappingURL=health.middleware.js.map