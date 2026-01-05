"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
const pino_logger_1 = require("../logger/pino.logger");
class RedisCache {
    client;
    constructor(client) {
        this.client = client;
    }
    async get(key) {
        pino_logger_1.logger.debug("Cache GET", { key });
        const data = await this.client.get(key);
        if (!data) {
            pino_logger_1.logger.debug("Cache MISS", { key });
            return null;
        }
        pino_logger_1.logger.debug("Cache HIT", { key });
        return JSON.parse(data);
    }
    async set(key, value, ttl) {
        pino_logger_1.logger.debug("Cache SET", { key, ttl });
        const payload = JSON.stringify(value);
        if (ttl)
            await this.client.set(key, payload, "EX", ttl);
        else
            await this.client.set(key, payload);
    }
    async delete(key) {
        pino_logger_1.logger.warn("Cache DELETE", { key });
        await this.client.del(key);
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redis.cache.js.map