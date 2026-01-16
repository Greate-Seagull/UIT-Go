"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullmqRequestQueue = void 0;
const bullmq_1 = require("bullmq");
class BullmqRequestQueue {
    jobTable;
    jobQueue;
    worker = null;
    queueEvents;
    constructor(redis, jobTable) {
        this.jobTable = jobTable;
        this.jobQueue = new bullmq_1.Queue("jobs", {
            connection: redis,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: 1000,
                attempts: 2,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            },
        });
        this.queueEvents = new bullmq_1.QueueEvents("jobs", { connection: redis });
        this.queueEvents.on("failed", ({ jobId, failedReason }) => console.error(`${jobId} failed: ${failedReason}`));
    }
    setupWorker(redis) {
        this.worker = new bullmq_1.Worker("jobs", async (job) => {
            const usecase = this.jobTable.get(job.data.usecaseId);
            if (!usecase)
                throw Error(`Invalid use case`);
            return usecase.execute(job.data.request);
        }, {
            connection: redis,
            concurrency: 100,
            limiter: {
                max: 1000,
                duration: 1000,
            },
        });
    }
    async close() {
        await this.jobQueue.close();
        if (this.worker)
            await this.worker.close();
    }
    async add(command) {
        return await this.jobQueue.add(command.usecaseId, command);
    }
    getQueueEvents() {
        return this.queueEvents;
    }
}
exports.BullmqRequestQueue = BullmqRequestQueue;
//# sourceMappingURL=bullmq.request-queue.js.map