import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/config";

const pool = new Pool({ connectionString: config.postgres.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Now you can check the pool status at any time:
console.log("Total Connections:", pool.totalCount);
console.log("Idle Connections:", pool.idleCount);
console.log("Busy Connections:", pool.totalCount - pool.idleCount);
console.log("Max allowed: ", pool.options.max);
console.log("Min allowed: ", pool.options.min);
