import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { trpc } from "../../trpc";
import { trpcDriverRouter } from "./driver/driver.trpc-router";

const trpcRouter = trpc.router({
	drivers: trpcDriverRouter,
});

export const createTrpcMiddleware = createExpressMiddleware({
	router: trpcRouter,
});

export type AppRouter = typeof trpcRouter;
