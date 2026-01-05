import jwt from "jsonwebtoken";
import { z } from "zod";
export declare class PasswordService {
    private readonly saltRound;
    constructor(saltRound: number);
    generateSalt(): string;
    hashPassword(barePassword: string, salt: string): string;
    comparePassword(barePassword: string, hashedPassword: string): boolean;
}
export type Expiry = `${number}${"s" | "m" | "h" | "d"}`;
export declare const authenticationTokenSchema: z.ZodObject<{
    id: z.ZodNumber;
}, z.core.$strip>;
export type AuthenticationTokenPayload = z.infer<typeof authenticationTokenSchema>;
export declare class TokenService {
    private readonly secret;
    private readonly expiry;
    constructor(secret: jwt.Secret, expiry: Expiry);
    generateJwt(payload: AuthenticationTokenPayload): string;
    verifyJwt(token: string): string | jwt.JwtPayload;
}
//# sourceMappingURL=encrypt.service.d.ts.map