export declare const trpcDriverRouter: import("@trpc/server").TRPCBuiltRouter<{
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
        output: import("../../../application/update-position.usecase").UpdatePositionUsecaseOutput;
        meta: object;
    }>;
}>>;
//# sourceMappingURL=driver.trpc-router.d.ts.map