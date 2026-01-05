import { requestQueue } from "../../infrastructure/request-queue/local.request-queue";
import { logger } from "../../infrastructure/logger/pino.logger";

export function controller(usecase: any) {
	return async (req: any, res: any) => {
		const input = {
			...(req.body || {}),
			...req.params,
			...req.query,
			authId: req.authId,
		};

		try {
			const result = await new Promise((resolve, reject) => {
				const ok = requestQueue.push({
					usecase,
					request: input,
					resolve,
					reject,
				});

				if (!ok) {
					return reject(new Error("Server overloaded"));
				}
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
