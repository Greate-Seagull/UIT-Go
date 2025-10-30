"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePositionProcedure = void 0;
exports.controlStartAccepting = controlStartAccepting;
exports.controlAcceptTrip = controlAcceptTrip;
exports.controlCompleteTrip = controlCompleteTrip;
const composition_root_1 = require("../../composition-root");
const trpc_1 = require("../../trpc");
const zod_1 = require("zod");
async function controlStartAccepting(req, res) {
    try {
        const result = await composition_root_1.startAcceptingUsecase.execute(req.body);
        res.json(result);
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlAcceptTrip(req, res) {
    try {
        const result = await composition_root_1.acceptTripUsecase.execute(req.body);
        res.json(result);
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlCompleteTrip(req, res) {
    try {
        const result = await composition_root_1.completeTripUsecase.execute(req.body);
        res.json(result);
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
exports.updatePositionProcedure = trpc_1.trpc.procedure
    .input(zod_1.z.object({ driverId: zod_1.z.number(), lat: zod_1.z.number(), long: zod_1.z.number() }))
    .mutation(async ({ input }) => {
    const result = await composition_root_1.updatePositionUsecase.execute(input);
    return result;
});
//# sourceMappingURL=driver.controller.js.map