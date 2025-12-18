import { Router } from "express";
import { controller } from "../../controllers/generic.controller";
import {
	acceptTripUsecase,
	completeTripUsecase,
	getSelfInfoUsecase,
	rejectTripUsecase,
	startAcceptingUsecase,
} from "../../../composition-root";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware";

const router = Router();

router.use(authenticationMiddleware);
router.get("/", controller(getSelfInfoUsecase));
router.put("/start", controller(startAcceptingUsecase));
router.put("/accept", controller(acceptTripUsecase));
router.put("/complete", controller(completeTripUsecase));
router.put("/reject", controller(rejectTripUsecase));

export default router;
