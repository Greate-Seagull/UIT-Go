import { Router } from "express";
import {
	controlAcceptTrip,
	controlCompleteTrip,
	controlSearchDriver,
	controlStartAccepting,
} from "../../controllers/driver.controller";

const router = Router();

router.put("/me/start", controlStartAccepting);
router.put("/me/accept", controlAcceptTrip);
router.put("/me/complete", controlCompleteTrip);
router.get("/search", controlSearchDriver);

export default router;
