import { Request, Response } from "express";
export declare function controlStartAccepting(req: Request, res: Response): Promise<void>;
export declare function controlAcceptTrip(req: Request, res: Response): Promise<void>;
export declare function controlCompleteTrip(req: Request, res: Response): Promise<void>;
export declare const updatePositionProcedure: import("@trpc/server").TRPCMutationProcedure<{
    input: {
        driverId: number;
        lat: number;
        long: number;
    };
    output: import("../../application/update-position.usecase").UpdatePositionUsecaseOutput;
    meta: object;
}>;
//# sourceMappingURL=driver.controller.d.ts.map