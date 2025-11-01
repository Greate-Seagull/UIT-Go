declare const trpcRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    drivers: import("@trpc/server").TRPCBuiltRouter<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        updatePosition: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                driverId: number;
                lat: number;
                long: number;
            };
            output: import("../../application/update-position.usecase").UpdatePositionUsecaseOutput;
            meta: object;
        }>;
    }>>;
}>>;
export declare const createTrpcMiddleware: import("express").Handler;
export type AppRouter = typeof trpcRouter;
export {};
//# sourceMappingURL=trpc.router.d.ts.map