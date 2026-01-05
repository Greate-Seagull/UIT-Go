"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = controller;
const local_request_queue_1 = require("../../infrastructure/request-queue/local.request-queue");
const pino_logger_1 = require("../../infrastructure/logger/pino.logger");
function controller(usecase) {
    return async (req, res) => {
        const input = {
            ...(req.body || {}),
            ...req.params,
            ...req.query,
            authId: req.authId,
        };
        pino_logger_1.logger.debug("Incoming request", {
            usecase: usecase.constructor.name,
            input,
        });
        try {
            const result = await new Promise((resolve, reject) => {
                const ok = local_request_queue_1.requestQueue.push({
                    usecase,
                    request: input,
                    resolve,
                    reject,
                });
                if (!ok) {
                    pino_logger_1.logger.warn("Queue is full, rejecting request", {
                        usecase: usecase.constructor.name,
                    });
                    return reject(new Error("Server overloaded"));
                }
                else {
                    pino_logger_1.logger.debug("Request queued", {
                        usecase: usecase.constructor.name,
                    });
                }
            });
            pino_logger_1.logger.info("Request completed successfully", {
                usecase: usecase.constructor.name,
                result,
            });
            res.jsend.success(result);
        }
        catch (error) {
            pino_logger_1.logger.error("Request failed", {
                usecase: usecase.constructor.name,
                error,
            });
            res.status(400).jsend.fail(error.message);
        }
    };
}
//# sourceMappingURL=generic.controller.js.map