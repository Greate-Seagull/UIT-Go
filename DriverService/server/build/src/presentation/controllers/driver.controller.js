"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePositionProcedure = void 0;
const composition_root_1 = require("../../composition-root");
const trpc_1 = require("../../trpc");
const zod_1 = require("zod");
exports.updatePositionProcedure = trpc_1.trpc.procedure
    .input(zod_1.z.object({ id: zod_1.z.number(), lat: zod_1.z.number(), long: zod_1.z.number() }))
    .mutation(async ({ input }) => {
    const result = await composition_root_1.updatePositionUsecase.execute(input);
    return result;
});
//# sourceMappingURL=driver.controller.js.map