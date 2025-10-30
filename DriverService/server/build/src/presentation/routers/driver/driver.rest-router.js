"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driver_controller_1 = require("../../controllers/driver.controller");
const router = (0, express_1.Router)();
router.put("/me/start", driver_controller_1.controlStartAccepting);
router.put("/me/accept", driver_controller_1.controlAcceptTrip);
router.put("/me/complete", driver_controller_1.controlCompleteTrip);
exports.default = router;
//# sourceMappingURL=driver.rest-router.js.map