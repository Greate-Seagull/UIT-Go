"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generic_controller_1 = require("../../controllers/generic.controller");
const composition_root_1 = require("../../../composition-root");
const authenticated_driver_rest_router_1 = __importDefault(require("./authenticated-driver.rest-router"));
const router = (0, express_1.Router)();
router.use("/me", authenticated_driver_rest_router_1.default);
router.post("/sign-up", (0, generic_controller_1.controller)(composition_root_1.signUpUsecase));
router.post("/sign-in", (0, generic_controller_1.controller)(composition_root_1.signInUsecase));
router.get("/search", (0, generic_controller_1.controller)(composition_root_1.searchDriverUsecase));
router.get("/:id/position", (0, generic_controller_1.controller)(composition_root_1.getPositionUsecase));
exports.default = router;
//# sourceMappingURL=driver.rest-router.js.map