"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRepository = void 0;
const buildSqlQuery_1 = require("./buildSqlQuery");
const account_entity_1 = require("../../domain/entities/account.entity");
const pino_logger_1 = require("../logger/pino.logger");
class AccountRepository {
    prisma;
    static baseQuery = (0, buildSqlQuery_1.buildQuery)(account_entity_1.accountSchema);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(transaction, account) {
        pino_logger_1.logger.debug("AccountRepository.add: Start", {
            account: { username: account.username },
        });
        const repo = transaction ? transaction.account : this.prisma.account;
        try {
            const raw = await repo.create({
                data: (0, buildSqlQuery_1.toPersistence)(account),
                select: AccountRepository.baseQuery,
            });
            pino_logger_1.logger.debug("AccountRepository.add: Saved", {
                accountId: raw.id,
            });
            return account_entity_1.Account.rehydrate(raw);
        }
        catch (error) {
            pino_logger_1.logger.error("AccountRepository.add: Failed", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async getByUsername(username) {
        pino_logger_1.logger.debug("AccountRepository.getByUsername: Query", { username });
        try {
            const raw = await this.prisma.account.findUnique({
                where: { username },
                select: AccountRepository.baseQuery,
            });
            if (!raw) {
                pino_logger_1.logger.debug("AccountRepository.getByUsername: Not found", {
                    username,
                });
                return null;
            }
            pino_logger_1.logger.debug("AccountRepository.getByUsername: Found", {
                accountId: raw.id,
            });
            return account_entity_1.Account.rehydrate(raw);
        }
        catch (error) {
            pino_logger_1.logger.error("AccountRepository.getByUsername: Failed", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async save(transaction, account) {
        pino_logger_1.logger.debug("AccountRepository.save: Start", {
            accountId: account.id,
        });
        const repo = transaction ? transaction.account : this.prisma.account;
        try {
            const raw = await repo.update({
                where: { id: account.id },
                data: (0, buildSqlQuery_1.toPersistence)(account),
                select: AccountRepository.baseQuery,
            });
            pino_logger_1.logger.debug("AccountRepository.save: Updated", {
                accountId: raw.id,
            });
            return account_entity_1.Account.rehydrate(raw);
        }
        catch (error) {
            pino_logger_1.logger.error("AccountRepository.save: Failed", {
                accountId: account.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}
exports.AccountRepository = AccountRepository;
//# sourceMappingURL=account.repository.js.map