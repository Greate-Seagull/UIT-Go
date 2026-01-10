import { performance } from "perf_hooks";
import { pool } from "../../composition-root";
import * as fs from "fs";
import * as path from "path";

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

// Create CSV files with headers
const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
const poolLogFile = path.join(logsDir, `pool-monitoring-${timestamp}.csv`);
const memoryLogFile = path.join(logsDir, `memory-monitoring-${timestamp}.csv`);
const eventLoopLogFile = path.join(
	logsDir,
	`event-loop-monitoring-${timestamp}.csv`,
);

// Initialize CSV files with headers
fs.writeFileSync(
	poolLogFile,
	"Timestamp,TotalCount,IdleCount,WaitingCount\n",
);
fs.writeFileSync(
	memoryLogFile,
	"Timestamp,HeapUsed_MB,HeapTotal_MB,External_MB,RSS_MB\n",
);
fs.writeFileSync(eventLoopLogFile, "Timestamp,Lag_MS\n");

export const startMonitoring = () => {
	// At application startup
	console.log("═══════════════════════════════════════");
	console.log("DATABASE POOL CONFIGURATION:");
	console.log("Max connections:", pool.options.max);
	console.log("Min connections:", pool.options.min);
	console.log("Connection timeout:", pool.options.connectionTimeoutMillis);
	console.log("═══════════════════════════════════════");
	console.log(`Pool logs: ${poolLogFile}`);
	console.log(`Memory logs: ${memoryLogFile}`);
	console.log(`Event loop logs: ${eventLoopLogFile}`);
	console.log("═══════════════════════════════════════");

	// Write configuration to a separate file
	const configFile = path.join(logsDir, `config-${timestamp}.txt`);
	fs.writeFileSync(
		configFile,
		`DATABASE POOL CONFIGURATION
Max connections: ${pool.options.max}
Min connections: ${pool.options.min}
Connection timeout: ${pool.options.connectionTimeoutMillis}
Test started: ${new Date().toISOString()}
`,
	);

	// Database connection pool monitoring (every 5 seconds)
	setInterval(() => {
		const now = new Date().toISOString();
		const poolData = {
			timestamp: now,
			totalCount: pool.totalCount,
			idleCount: pool.idleCount,
			waitingCount: pool.waitingCount,
		};

		// Console output
		console.log(poolData);

		// CSV output
		fs.appendFileSync(
			poolLogFile,
			`${now},${poolData.totalCount},${poolData.idleCount},${poolData.waitingCount}\n`,
		);
	}, 5000);

	// Event loop lag monitoring (every 1 second)
	let lastCheck = performance.now();
	setInterval(() => {
		const now = performance.now();
		const lag = now - lastCheck - 1000;
		lastCheck = now;

		if (lag > 100) {
			const timestamp = new Date().toISOString();
			console.warn(`Event loop lag: ${Math.round(lag)}ms`);

			// CSV output
			fs.appendFileSync(
				eventLoopLogFile,
				`${timestamp},${Math.round(lag)}\n`,
			);
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
		console.log({
			heapUsed: memoryData.heapUsed + "MB",
			heapTotal: memoryData.heapTotal + "MB",
			external: memoryData.external + "MB",
			rss: memoryData.rss + "MB",
		});

		// CSV output
		fs.appendFileSync(
			memoryLogFile,
			`${now},${memoryData.heapUsed},${memoryData.heapTotal},${memoryData.external},${memoryData.rss}\n`,
		);
	}, 10000);
};