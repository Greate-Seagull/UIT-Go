import { Router } from "express";
import {
	controlAcceptTrip,
	controlStartAccepting,
} from "../controllers/driver.controller";

const router = Router();

router.put("/me/start", controlStartAccepting);
router.put("/:driverId/accept", controlAcceptTrip);

export default router;
