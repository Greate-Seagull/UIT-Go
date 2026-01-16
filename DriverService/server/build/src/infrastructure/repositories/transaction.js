"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionManager = void 0;
class TransactionManager {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async transaction(callback) {
        return await this.prisma.$transaction(callback);
    }
}
exports.TransactionManager = TransactionManager;
//# sourceMappingURL=transaction.js.map