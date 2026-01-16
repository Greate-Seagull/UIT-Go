import { Command, InMemoryQueue, requestQueue } from "./local.request-queue";

export async function workerLoop(requestQueue: InMemoryQueue<Command>) {
	while (true) {
		const job = requestQueue.pop();

		if (job) {
			try {
				const result = await job.usecase.execute(job.request);
				job.resolve(result);
			} catch (err) {
				job.reject(err);
			}
		} else {
			await new Promise((r) => setTimeout(r, 10));
		}
	}
}
