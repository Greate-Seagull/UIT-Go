import z from "zod";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
export declare const outputSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    licensePlate: z.ZodString;
}, z.core.$strip>;
export declare class GetSelfInfoUsecase {
    private readonly driverRepo;
    constructor(driverRepo: DriverRepository);
    execute(input: any): Promise<{
        id: number;
        name: string;
        licensePlate: string;
    }>;
}
//# sourceMappingURL=get-self.usecase.d.ts.map