import { Cluster } from "ioredis";
import { Queue, QueueEvents, Worker } from "bullmq";
import { JobTable } from "../cache/job-table";

export interface Command {
	request: any;
	usecaseId: string;
}

export class BullmqRequestQueue {
	public static queueName: String = "jobs";

	private jobTable: JobTable;
	private jobQueue: Queue<Command>;
	private worker: Worker<Command> | null = null;
	private queueEvents: QueueEvents;

	constructor(redis: Cluster, jobTable: JobTable) {
		this.jobTable = jobTable;
		this.jobQueue = new Queue<Command>(
			`{${BullmqRequestQueue.queueName}}`,
			{
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
			}
		);
		this.queueEvents = new QueueEvents(
			`{${BullmqRequestQueue.queueName}}`,
			{ connection: redis }
		);
		this.queueEvents.on("failed", ({ jobId, failedReason }) =>
			console.error(`${jobId} failed: ${failedReason}`)
		);
	}

	setupWorker(redis: Cluster) {
		this.worker = new Worker<Command>(
			`{${BullmqRequestQueue.queueName}}`,
			async (job) => {
				const usecase = this.jobTable.get(job.data.usecaseId);
				if (!usecase) throw Error(`Invalid use case`);
				return usecase.execute(job.data.request);
			},
			{
				connection: redis,
				concurrency: 100,
				limiter: {
					max: 1000,
					duration: 1000,
				},
			}
		);
	}

	async close(): Promise<void> {
		await this.jobQueue.close();
		if (this.worker) await this.worker.close();
	}

	async add(command: Command) {
		return await this.jobQueue.add(command.usecaseId, command);
	}

	getQueueEvents() {
		return this.queueEvents;
	}
}
