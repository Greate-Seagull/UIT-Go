import { PrismaClient } from "../../generated/client/client";
import { Driver } from "../../domain/driver.entity";
import { Transaction } from "./transaction";
export declare class DriverRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    getById(id: any): Promise<Driver>;
    save(tx: Transaction | null, entity: Driver): Promise<Driver>;
}
//# sourceMappingURL=driver.repository.d.ts.map