import express from "express";
import restRouter from "./presentation/routers/rest.router";
import { createTrpcMiddleware } from "./presentation/routers/trpc.router";

const app = express();

app.use(express.json());
app.use("/api", restRouter);
app.use("/trpc", createTrpcMiddleware);

export default app;
