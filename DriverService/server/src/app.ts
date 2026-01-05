import express from "express";
import jsend from "jsend";
import restRouter from "./presentation/routers/rest.router";
import { createTrpcMiddleware } from "./presentation/routers/trpc.router";
import { healthCheck } from "./presentation/middlewares/health.middleware";

const app = express();

app.use(express.json());
app.use(jsend.middleware);

app.use("/api", restRouter);
app.use("/trpc", createTrpcMiddleware);
app.use("/health", healthCheck);

export default app;
