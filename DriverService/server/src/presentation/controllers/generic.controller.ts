import { requestQueue } from "../../infrastructure/request-queue/local.request-queue";
import { logger } from "../../infrastructure/logger/pino.logger";

export function controller(usecase: any) {
	return async (req: any, res: any) => {
		const input = {
			...(req.body || {}),
			...req.params,
			...req.query,
		};

		logger.debug("Incoming request", {
			usecase: usecase.constructor.name,
			input,
		});

		try {
			const result = await new Promise((resolve, reject) => {
				const ok = requestQueue.push({
					usecase,
					request: input,
					resolve,
					reject,
				});

				if (!ok) {
					logger.warn("Queue is full, rejecting request", {
						usecase: usecase.constructor.name,
					});
					return reject(new Error("Server overloaded"));
				} else {
					logger.debug("Request queued", {
						usecase: usecase.constructor.name,
					});
				}
			});

			logger.info("Request completed successfully", {
				usecase: usecase.constructor.name,
				result,
			});
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
