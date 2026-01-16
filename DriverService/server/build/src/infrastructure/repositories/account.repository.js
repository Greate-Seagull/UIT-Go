"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRepository = void 0;
const buildSqlQuery_1 = require("./buildSqlQuery");
const account_entity_1 = require("../../domain/entities/account.entity");
class AccountRepository {
    prisma;
    static baseQuery = (0, buildSqlQuery_1.buildQuery)(account_entity_1.accountSchema);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(transaction, account) {
        const repo = transaction ? transaction.account : this.prisma.account;
        const raw = await repo.create({
            data: (0, buildSqlQuery_1.toPersistence)(account),
            select: AccountRepository.baseQuery,
        });
        return account_entity_1.Account.rehydrate(raw);
    }
    async getByUsername(username) {
        const raw = await this.prisma.account.findUnique({
            where: { username },
            select: AccountRepository.baseQuery,
        });
        return account_entity_1.Account.rehydrate(raw);
    }
    async save(transaction, account) {
        const repo = transaction ? transaction.account : this.prisma.account;
        const raw = await repo.update({
            where: { id: account.id },
            data: (0, buildSqlQuery_1.toPersistence)(account),
            select: AccountRepository.baseQuery,
        });
        return account_entity_1.Account.rehydrate(raw);
    }
}
exports.AccountRepository = AccountRepository;
//# sourceMappingURL=account.repository.js.map