"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRepository = void 0;
const driver_entity_1 = require("../../domain/entities/driver.entity");
const pino_logger_1 = require("../logger/pino.logger");
const normalized_cache_1 = require("../cache/normalized-cache");
const buildSqlQuery_1 = require("./buildSqlQuery");
class DriverRepository {
    prisma;
    cache;
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    static cacheTtl = 900;
    static baseQuery = (0, buildSqlQuery_1.buildQuery)(driver_entity_1.driverSchema);
    cacheKey(id) {
        return `driver:${id}`;
    }
    async getById(id) {
        pino_logger_1.logger.debug("DriverRepository.getById called", { id });
        const key = this.cacheKey(id);
        // Try cache first
        const cached = await this.cache.get(key);
        if (cached) {
            const normalized = (0, normalized_cache_1.normalizeCachedObject)(cached);
            const domain = driver_entity_1.Driver.rehydrate(normalized);
            pino_logger_1.logger.info("Driver loaded from cache", {
                data: cached,
            });
            return domain;
        }
        pino_logger_1.logger.warn("Driver cache MISS → loading from DB", { id });
        const row = await this.prisma.driver.findUnique({
            where: { id },
            select: DriverRepository.baseQuery,
        });
        if (!row) {
            pino_logger_1.logger.error("Driver not found in DB", { id });
            return null;
        }
        const domain = driver_entity_1.Driver.rehydrate(row);
        // Write to cache
        await this.cache.set(key, domain, DriverRepository.cacheTtl);
        pino_logger_1.logger.info("Driver cached after DB fetch", { id });
        return domain;
    }
    async add(tx, entity) {
        pino_logger_1.logger.debug("DriverRepository.add called", { id: entity.id });
        const repo = tx ? tx.driver : this.prisma.driver;
        const row = await repo.create({
            data: (0, buildSqlQuery_1.toPersistence)(entity),
            select: DriverRepository.baseQuery,
        });
        const domain = driver_entity_1.Driver.rehydrate(row);
        await this.cache.set(this.cacheKey(domain.id), domain, DriverRepository.cacheTtl);
        pino_logger_1.logger.info("Driver added & cached", { id: domain.id });
        return domain;
    }
    async save(tx, entity) {
        pino_logger_1.logger.debug("DriverRepository.save called", {
            id: entity.id,
            newState: entity.state,
        });
        const repo = tx ? tx.driver : this.prisma.driver;
        const row = await repo.update({
            where: { id: entity.id },
            data: (0, buildSqlQuery_1.toPersistence)(entity),
            select: DriverRepository.baseQuery,
        });
        const domain = driver_entity_1.Driver.rehydrate(row);
        // update cache
        await this.cache.set(this.cacheKey(domain.id), domain, DriverRepository.cacheTtl);
        pino_logger_1.logger.info("Driver updated & cache refreshed", {
            id: entity.id,
            state: entity.state,
        });
        return domain;
    }
}
exports.DriverRepository = DriverRepository;
//# sourceMappingURL=driver.repository.js.map