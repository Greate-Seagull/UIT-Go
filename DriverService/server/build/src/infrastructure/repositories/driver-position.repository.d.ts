import Redis from "ioredis";
import { DriverPosition } from "../../domain/driver-position.entity";
export declare class DriverPositionRepository {
    private readonly redis;
    static readonly GEO_KEY = "driver_positions";
    constructor(redis: Redis);
    getById(id: any): Promise<any>;
    save(entity: DriverPosition): Promise<DriverPosition>;
    expire(entity: DriverPosition, expiryInMinute: number): Promise<void>;
    find(lat: any, long: any, radiusMeters: any): Promise<any[]>;
}
//# sourceMappingURL=driver-position.repository.d.ts.map