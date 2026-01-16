"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generic_controller_1 = require("../../controllers/generic.controller");
const composition_root_1 = require("../../../composition-root");
const authentication_middleware_1 = require("../../middlewares/authentication.middleware");
const router = (0, express_1.Router)();
router.use(authentication_middleware_1.authenticationMiddleware);
router.get("/", (0, generic_controller_1.controller)(composition_root_1.getSelfInfoUsecase));
router.put("/start", (0, generic_controller_1.controller)(composition_root_1.startAcceptingUsecase));
router.put("/accept", (0, generic_controller_1.controller)(composition_root_1.acceptTripUsecase));
router.put("/complete", (0, generic_controller_1.controller)(composition_root_1.completeTripUsecase));
router.put("/reject", (0, generic_controller_1.controller)(composition_root_1.rejectTripUsecase));
exports.default = router;
//# sourceMappingURL=authenticated-driver.rest-router.js.map