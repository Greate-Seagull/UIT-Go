"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrpcMiddleware = void 0;
const express_1 = require("@trpc/server/adapters/express");
const trpc_1 = require("../../trpc");
const driver_trpc_router_1 = require("./driver/driver.trpc-router");
const trpcRouter = trpc_1.trpc.router({
    drivers: driver_trpc_router_1.trpcDriverRouter,
});
exports.createTrpcMiddleware = (0, express_1.createExpressMiddleware)({
    router: trpcRouter,
});
//# sourceMappingURL=trpc.router.js.map