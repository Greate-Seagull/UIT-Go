import "dotenv/config";
import express from "express";
import driverRouter from "./presentation/routes/driver.route";

const app = express();

app.use(express.json());
app.use("/drivers", driverRouter);

export default app;
