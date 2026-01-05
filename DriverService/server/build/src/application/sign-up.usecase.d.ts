import z from "zod";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { AccountRepository } from "../infrastructure/repositories/account.repository";
import { PasswordService, TokenService } from "../domain/service/encrypt.service";
export declare const outputSchema: z.ZodObject<{
    token: z.ZodString;
    driverId: z.ZodNumber;
}, z.core.$strip>;
export declare class SignUpUseCase {
    private readonly driverRepository;
    private readonly accountRepository;
    private readonly passwordService;
    private readonly tokenService;
    constructor(driverRepository: DriverRepository, accountRepository: AccountRepository, passwordService: PasswordService, tokenService: TokenService);
    execute(input: any): Promise<{
        token: string;
        driverId: number;
    }>;
}
//# sourceMappingURL=sign-up.usecase.d.ts.map