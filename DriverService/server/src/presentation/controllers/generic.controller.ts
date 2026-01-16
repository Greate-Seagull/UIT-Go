import { logger } from "../../infrastructure/logger/pino.logger";
import { messageQueue } from "../../composition-root";
import { Usecase } from "../../infrastructure/cache/job-table";

export function controller(usecase: Usecase) {
	return async (req: any, res: any) => {
		const input = {
			...(req.body || {}),
			...req.params,
			...req.query,
			authId: req.authId,
		};

		try {
			const job = await messageQueue.add({
				request: input,
				usecaseId: usecase.constructor.name,
			});
			const result = await job.waitUntilFinished(
				messageQueue.getQueueEvents()
			);
			console.log(result);

			res.jsend.success(result);
		} catch (error: any) {
			logger.error("Request failed", {
				usecase: usecase.constructor.name,
				error,
			});
			res.status(400).jsend.fail(error.message);
		}
	};
}
