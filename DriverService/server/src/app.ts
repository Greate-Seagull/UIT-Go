import express from "express";
import restDriverRouter from "./presentation/routers/driver/driver.rest-router";
import { createTrpcMiddleware } from "./presentation/routers/trpc.router";

const app = express();

app.use(express.json());
app.use("/api/drivers", restDriverRouter);
app.use("/trpc", createTrpcMiddleware);

export default app;
