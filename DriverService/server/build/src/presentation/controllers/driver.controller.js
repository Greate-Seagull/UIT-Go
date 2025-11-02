"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePositionProcedure = void 0;
exports.controlStartAccepting = controlStartAccepting;
exports.controlAcceptTrip = controlAcceptTrip;
exports.controlCompleteTrip = controlCompleteTrip;
exports.controlSearchDriver = controlSearchDriver;
exports.controlRejectTrip = controlRejectTrip;
exports.controlGetPosition = controlGetPosition;
const composition_root_1 = require("../../composition-root");
const trpc_1 = require("../../trpc");
const zod_1 = require("zod");
const search_driver_usecase_1 = require("../../application/search-driver.usecase");
const accept_trip_usecase_1 = require("../../application/accept-trip.usecase");
const reject_trip_usecase_1 = require("../../application/reject-trip.usecase");
const get_position_usecase_1 = require("../../application/get-position.usecase");
const start_accepting_usecase_1 = require("../../application/start-accepting.usecase");
async function controlStartAccepting(req, res) {
    try {
        console.log(`Call API PUT /api/drivers/me/start`);
        let input = new start_accepting_usecase_1.StartAcceptingUsecaseInput();
        input.id = Number(req.body.id);
        const result = await composition_root_1.startAcceptingUsecase.execute(input);
        res.json(result);
        console.log(`Complete API PUT /api/drivers/me/start`);
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlAcceptTrip(req, res) {
    try {
        console.log("Call API PUT /api/drivers/me/accept");
        let input = new accept_trip_usecase_1.AcceptTripUsecaseInput();
        input.driverId = Number(req.body.driverId);
        input.offerId = Number(req.body.offerId);
        const result = await composition_root_1.acceptTripUsecase.execute(input);
        res.json(result);
        console.log("Complete API PUT /api/drivers/me/accept");
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlCompleteTrip(req, res) {
    try {
        console.log("Call API PUT /api/drivers/me/complete");
        const result = await composition_root_1.completeTripUsecase.execute(req.body);
        res.json(result);
        console.log("Complete API PUT /api/drivers/me/complete");
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlSearchDriver(req, res) {
    try {
        console.log("Call API GET /api/drivers/search");
        let input = new search_driver_usecase_1.SearchDriverUsecaseInput();
        input.lat = Number(req.query.lat);
        input.lng = Number(req.query.lng);
        input.radiusMeters = Number(req.query.radiusMeters);
        input.limit = Number(req.query.limit);
        const result = await composition_root_1.searchDriverUsecase.execute(input);
        res.json(result);
        console.log("Complete API GET /api/drivers/search");
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlRejectTrip(req, res) {
    try {
        console.log("Call API PUT /api/drivers/me/reject");
        let input = new reject_trip_usecase_1.RejectTripUsecaseInput();
        input.driverId = Number(req.body.driverId);
        input.offerId = Number(req.body.offerId);
        const result = await composition_root_1.rejectTripUsecase.execute(input);
        res.json(result);
        console.log("Complete API PUT /api/drivers/me/reject");
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
async function controlGetPosition(req, res) {
    try {
        console.log(`Call API GET /api/drivers/${req.params.driverId}/position`);
        let input = new get_position_usecase_1.GetPositionUsecaseInput();
        input.driverId = Number(req.params.driverId);
        const result = await composition_root_1.getPositionUsecase.execute(input);
        res.json(result);
        console.log(`Complete API GET /api/drivers/${req.params.driverId}/position`);
    }
    catch (e) {
        res.json({ message: e.message });
    }
}
exports.updatePositionProcedure = trpc_1.trpc.procedure
    .input(zod_1.z.object({ driverId: zod_1.z.number(), lat: zod_1.z.number(), long: zod_1.z.number() }))
    .mutation(async ({ input }) => {
    console.log("Call API POST trpc/drivers.updatePosition");
    const result = await composition_root_1.updatePositionUsecase.execute(input);
    console.log("Complete API POST trpc/drivers.updatePosition");
    return result;
});
//# sourceMappingURL=driver.controller.js.map