import { PrismaClient, Prisma } from "../../generated/client/client";
export type Transaction = Prisma.TransactionClient;
export declare class TransactionManager {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    transaction(callback: (tx: Transaction) => Promise<any>): Promise<any>;
}
//# sourceMappingURL=transaction.d.ts.map