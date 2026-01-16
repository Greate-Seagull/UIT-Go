import z from "zod";
import { NextFunction } from "express";
export declare const bearerTokenHeaderSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare function authenticationMiddleware(req: any, res: any, next: NextFunction): void;
//# sourceMappingURL=authentication.middleware.d.ts.map