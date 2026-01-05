import { PrismaClient } from "@prisma/client";
export declare class AccountRepository implements AccountRepository {
    private readonly prisma;
    static baseQuery: any;
    constructor(prisma: PrismaClient);
    add(transaction: any, account: any): Promise<any>;
    getByUsername(username: string): Promise<any>;
    save(transaction: any, account: any): Promise<any>;
}
//# sourceMappingURL=account.repository.d.ts.map