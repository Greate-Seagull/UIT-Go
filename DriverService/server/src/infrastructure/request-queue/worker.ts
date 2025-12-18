import { Command, InMemoryQueue, requestQueue } from "./local.request-queue";
import { logger } from "../../infrastructure/logger/pino.logger";

export async function workerLoop(requestQueue: InMemoryQueue<Command>) {
	while (true) {
		const job = requestQueue.pop();

		if (job) {
			const start = Date.now();
			logger.debug("Worker picked up job", {
				usecase: job.usecase.constructor.name,
				request: job.request,
			});

			try {
				const result = await job.usecase.execute(job.request);
				job.resolve(result);

				const duration = Date.now() - start;
				logger.info("Job completed successfully", {
					usecase: job.usecase.constructor.name,
					durationMs: duration,
					result,
				});
			} catch (err) {
				job.reject(err);
				const duration = Date.now() - start;
				logger.error("Job failed", {
					usecase: job.usecase.constructor.name,
					durationMs: duration,
					error: err,
				});
			}
		} else {
			await new Promise((r) => setTimeout(r, 10));
		}
	}
}
