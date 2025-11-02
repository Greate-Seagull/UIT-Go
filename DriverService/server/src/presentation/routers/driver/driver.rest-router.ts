import { Router } from "express";
import {
	controlAcceptTrip,
	controlCompleteTrip,
	controlGetPosition,
	controlRejectTrip,
	controlSearchDriver,
	controlStartAccepting,
} from "../../controllers/driver.controller";

const router = Router();

router.put("/me/start", controlStartAccepting);
router.put("/me/accept", controlAcceptTrip);
router.put("/me/complete", controlCompleteTrip);
router.get("/search", controlSearchDriver);
router.put("/me/reject", controlRejectTrip);
router.get("/:driverId/position", controlGetPosition);

export default router;
