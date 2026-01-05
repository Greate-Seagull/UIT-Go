"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerLoop = workerLoop;
const pino_logger_1 = require("../../infrastructure/logger/pino.logger");
async function workerLoop(requestQueue) {
    while (true) {
        const job = requestQueue.pop();
        if (job) {
            const start = Date.now();
            pino_logger_1.logger.debug("Worker picked up job", {
                usecase: job.usecase.constructor.name,
                request: job.request,
            });
            try {
                const result = await job.usecase.execute(job.request);
                job.resolve(result);
                const duration = Date.now() - start;
                pino_logger_1.logger.info("Job completed successfully", {
                    usecase: job.usecase.constructor.name,
                    durationMs: duration,
                    result,
                });
            }
            catch (err) {
                job.reject(err);
                const duration = Date.now() - start;
                pino_logger_1.logger.error("Job failed", {
                    usecase: job.usecase.constructor.name,
                    durationMs: duration,
                    error: err,
                });
            }
        }
        else {
            await new Promise((r) => setTimeout(r, 10));
        }
    }
}
//# sourceMappingURL=worker.js.map