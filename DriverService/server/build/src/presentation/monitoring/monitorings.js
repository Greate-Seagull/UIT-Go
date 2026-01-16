"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMonitoring = void 0;
const perf_hooks_1 = require("perf_hooks");
const composition_root_1 = require("../../composition-root");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../../config/config");
// Create logs directory if it doesn't exist
const logsDir = config_1.config.logs.DIR || path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
// Create CSV files with headers
const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
const poolLogFile = path.join(logsDir, `pool-monitoring-${timestamp}.csv`);
const memoryLogFile = path.join(logsDir, `memory-monitoring-${timestamp}.csv`);
const eventLoopLogFile = path.join(logsDir, `event-loop-monitoring-${timestamp}.csv`);
// Initialize CSV files with headers
fs.writeFileSync(poolLogFile, "Timestamp,TotalCount,IdleCount,WaitingCount\n");
fs.writeFileSync(memoryLogFile, "Timestamp,HeapUsed_MB,HeapTotal_MB,External_MB,RSS_MB\n");
fs.writeFileSync(eventLoopLogFile, "Timestamp,Lag_MS\n");
const startMonitoring = () => {
    // At application startup
    // console.log("═══════════════════════════════════════");
    // console.log("DATABASE POOL CONFIGURATION:");
    // console.log("Max connections:", pool.options.max);
    // console.log("Min connections:", pool.options.min);
    // console.log("Connection timeout:", pool.options.connectionTimeoutMillis);
    // console.log("═══════════════════════════════════════");
    // console.log(`Pool logs: ${poolLogFile}`);
    // console.log(`Memory logs: ${memoryLogFile}`);
    // console.log(`Event loop logs: ${eventLoopLogFile}`);
    // console.log("═══════════════════════════════════════");
    // Write configuration to a separate file
    const configFile = path.join(logsDir, `config-${timestamp}.txt`);
    fs.writeFileSync(configFile, `DATABASE POOL CONFIGURATION
Max connections: ${composition_root_1.pool.options.max}
Min connections: ${composition_root_1.pool.options.min}
Connection timeout: ${composition_root_1.pool.options.connectionTimeoutMillis}
Test started: ${new Date().toISOString()}
`);
    // Database connection pool monitoring (every 5 seconds)
    setInterval(() => {
        const now = new Date().toISOString();
        const poolData = {
            timestamp: now,
            totalCount: composition_root_1.pool.totalCount,
            idleCount: composition_root_1.pool.idleCount,
            waitingCount: composition_root_1.pool.waitingCount,
        };
        // Console output
        // console.log(poolData);
        // CSV output
        fs.appendFileSync(poolLogFile, `${now},${poolData.totalCount},${poolData.idleCount},${poolData.waitingCount}\n`);
    }, 5000);
    // Event loop lag monitoring (every 1 second)
    let lastCheck = perf_hooks_1.performance.now();
    setInterval(() => {
        const now = perf_hooks_1.performance.now();
        const lag = now - lastCheck - 1000;
        lastCheck = now;
        if (lag > 100) {
            const timestamp = new Date().toISOString();
            // console.warn(`Event loop lag: ${Math.round(lag)}ms`);
            // CSV output
            fs.appendFileSync(eventLoopLogFile, `${timestamp},${Math.round(lag)}\n`);
        }
    }, 1000);
    // Memory monitoring (every 10 seconds)
    setInterval(() => {
        const now = new Date().toISOString();
        const usage = process.memoryUsage();
        const memoryData = {
            timestamp: now,
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024),
            rss: Math.round(usage.rss / 1024 / 1024),
        };
        // Console output
        // console.log({
        // 	heapUsed: memoryData.heapUsed + "MB",
        // 	heapTotal: memoryData.heapTotal + "MB",
        // 	external: memoryData.external + "MB",
        // 	rss: memoryData.rss + "MB",
        // });
        // CSV output
        fs.appendFileSync(memoryLogFile, `${now},${memoryData.heapUsed},${memoryData.heapTotal},${memoryData.external},${memoryData.rss}\n`);
    }, 10000);
};
exports.startMonitoring = startMonitoring;
//# sourceMappingURL=monitorings.js.map