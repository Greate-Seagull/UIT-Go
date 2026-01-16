import { pool } from "../../composition-root";

export async function healthCheck(req: any, res: any) {
	const health = {
		uptime: process.uptime(),
		timestamp: Date.now(),
		dbPool: {
			total: pool.totalCount,
			idle: pool.idleCount,
			waiting: pool.waitingCount,
		},
		memory: process.memoryUsage(),
	};
	res.jsend.success(health);
}
