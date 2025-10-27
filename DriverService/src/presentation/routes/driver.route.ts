import { Router } from "express";
import {
	controlAcceptTrip,
	controlStartAccepting,
} from "../controllers/driver.controller";

const router = Router();

router.put("/:driverId/state", controlStartAccepting);
router.put("/:driverId/accept", controlAcceptTrip);

export default router;
