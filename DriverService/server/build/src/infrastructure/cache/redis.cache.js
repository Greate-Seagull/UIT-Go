"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
class RedisCache {
    client;
    constructor(client) {
        this.client = client;
    }
    async get(key) {
        const data = await this.client.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data);
    }
    async set(key, value, ttl) {
        const payload = JSON.stringify(value);
        if (ttl)
            await this.client.set(key, payload, "EX", ttl);
        else
            await this.client.set(key, payload);
    }
    async delete(key) {
        await this.client.del(key);
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redis.cache.js.map