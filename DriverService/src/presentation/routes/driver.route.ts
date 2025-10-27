import { Router } from "express";
import { controlStartAccepting } from "../controllers/driver.controller";

const router = Router();

router.put("/:driverId/state", controlStartAccepting);

export default router;
