import { Router } from "express";
import {
	controlAcceptTrip,
	controlCompleteTrip,
	controlStartAccepting,
} from "../../controllers/driver.controller";

const router = Router();

router.put("/me/start", controlStartAccepting);
router.put("/me/accept", controlAcceptTrip);
router.put("/me/complete", controlCompleteTrip);

export default router;
