import { Router } from "express";
import { controller } from "../../controllers/generic.controller";
import {
	getPositionUsecase,
	searchDriverUsecase,
	signInUsecase,
	signUpUsecase,
} from "../../../composition-root";
import authenticatedDriverRouter from "./authenticated-driver.rest-router";

const router = Router();

router.use("/me", authenticatedDriverRouter);

router.post("/sign-up", controller(signUpUsecase));
router.post("/sign-in", controller(signInUsecase));
router.get("/search", controller(searchDriverUsecase));
router.get("/:id/position", controller(getPositionUsecase));

export default router;
