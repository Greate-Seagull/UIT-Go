"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const local_request_queue_1 = require("./src/infrastructure/request-queue/local.request-queue");
const worker_1 = require("./src/infrastructure/request-queue/worker");
const PORT = 3000;
(0, worker_1.workerLoop)(local_request_queue_1.requestQueue);
app_1.default.listen(PORT, (error) => {
    if (error)
        throw error;
    console.log(`Version 1.0.1`);
    console.log(`Listening to http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map