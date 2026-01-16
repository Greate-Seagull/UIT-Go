"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const config_1 = require("../config/config");
const pool = new pg_1.Pool({ connectionString: config_1.config.postgres.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
// Now you can check the pool status at any time:
console.log("Total Connections:", pool.totalCount);
console.log("Idle Connections:", pool.idleCount);
console.log("Busy Connections:", pool.totalCount - pool.idleCount);
console.log("Max allowed: ", pool.options.max);
console.log("Min allowed: ", pool.options.min);
//# sourceMappingURL=check-db.js.map