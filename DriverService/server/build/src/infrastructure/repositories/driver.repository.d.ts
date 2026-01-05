import { PrismaClient } from "@prisma/client";
import { Transaction } from "./transaction";
import { RedisCache } from "../cache/redis.cache";
export declare class DriverRepository {
    private prisma;
    private readonly cache;
    constructor(prisma: PrismaClient, cache: RedisCache);
    static cacheTtl: number;
    static baseQuery: any;
    private cacheKey;
    getById(id: number): Promise<any>;
    add(tx: Transaction | null, entity: any): Promise<any>;
    save(tx: Transaction | null, entity: any): Promise<any>;
}
//# sourceMappingURL=driver.repository.d.ts.map