"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRepository = void 0;
const driver_mapper_1 = require("../mappers/driver.mapper");
class DriverRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getById(id) {
        const row = await this.prisma.driver.findUnique({
            where: { id: id },
        });
        return driver_mapper_1.DriverMapper.toDomain(row);
    }
    async save(tx, entity) {
        const repo = tx ? tx.driver : this.prisma.driver;
        const row = await repo.update({
            where: {
                id: entity.id,
            },
            data: {
                state: entity.state,
            },
        });
        return driver_mapper_1.DriverMapper.toDomain(row);
    }
}
exports.DriverRepository = DriverRepository;
//# sourceMappingURL=driver.repository.js.map