import Redis from "ioredis";
export declare class RedisCache {
    private readonly client;
    constructor(client: Redis);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
}
//# sourceMappingURL=redis.cache.d.ts.map