"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpcDriverRouter = void 0;
const trpc_1 = require("../../../trpc");
const driver_controller_1 = require("../../controllers/driver.controller");
exports.trpcDriverRouter = trpc_1.trpc.router({
    updatePosition: driver_controller_1.updatePositionProcedure,
});
//# sourceMappingURL=driver.trpc-router.js.map