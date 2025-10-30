import { Router } from "express";
import {
	controlAcceptTrip,
	controlStartAccepting,
	controlUpdatePosition,
} from "../controllers/driver.controller";

const router = Router();

router.put("/me/start", controlStartAccepting);
router.put("/me/accept", controlAcceptTrip);
router.post("/me/position", controlUpdatePosition);

export default router;
