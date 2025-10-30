import { Router } from "express";
import restDriverRouter from "../routers/driver/driver.rest-router";

const router = Router();

router.use("/drivers", restDriverRouter);

export default router;
