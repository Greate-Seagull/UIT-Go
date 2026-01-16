"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controller = controller;
const pino_logger_1 = require("../../infrastructure/logger/pino.logger");
const composition_root_1 = require("../../composition-root");
function controller(usecase) {
    return async (req, res) => {
        const input = {
            ...(req.body || {}),
            ...req.params,
            ...req.query,
            authId: req.authId,
        };
        try {
            const job = await composition_root_1.messageQueue.add({
                request: input,
                usecaseId: usecase.constructor.name,
            });
            const result = await job.waitUntilFinished(composition_root_1.messageQueue.getQueueEvents());
            console.log(result);
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