import z from "zod";
import { PasswordService, TokenService } from "../domain/service/encrypt.service";
import { AccountRepository } from "../infrastructure/repositories/account.repository";
export declare const outputSchema: z.ZodObject<{
    token: z.ZodString;
    driverId: z.ZodNumber;
}, z.core.$strip>;
export declare class SignInUsecase {
    private readonly accountRepo;
    private readonly passwordService;
    private readonly tokenService;
    constructor(accountRepo: AccountRepository, passwordService: PasswordService, tokenService: TokenService);
    execute(input: any): Promise<{
        token: string;
        driverId: number;
    }>;
}
//# sourceMappingURL=sign-in.usecase.d.ts.map