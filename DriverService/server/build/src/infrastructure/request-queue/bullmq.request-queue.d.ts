import Redis from "ioredis";
import { Job, QueueEvents } from "bullmq";
import { JobTable } from "../cache/job-table";
export interface Command {
    request: any;
    usecaseId: string;
}
export declare class BullmqRequestQueue {
    private jobTable;
    private jobQueue;
    private worker;
    private queueEvents;
    constructor(redis: Redis, jobTable: JobTable);
    setupWorker(redis: Redis): void;
    close(): Promise<void>;
    add(command: Command): Promise<Job<Command, any, string>>;
    getQueueEvents(): QueueEvents;
}
//# sourceMappingURL=bullmq.request-queue.d.ts.map