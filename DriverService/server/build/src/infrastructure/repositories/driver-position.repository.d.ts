import Redis from "ioredis";
import { DriverPosition } from "../../domain/driver-position.entity";
export declare class DriverPositionRepository {
    private readonly redis;
    constructor(redis: Redis);
    getById(id: any): Promise<DriverPosition>;
    save(entity: DriverPosition): Promise<DriverPosition>;
    expire(entity: DriverPosition, expiryInMinute: number): Promise<void>;
}
//# sourceMappingURL=driver-position.repository.d.ts.map