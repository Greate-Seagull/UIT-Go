import z from "zod";
export declare const accountSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    username: z.ZodString;
    password: z.ZodString;
    salt: z.ZodString;
    driverId: z.ZodNumber;
}, z.core.$strip>;
export declare class Account {
    static create(input: any): Account & {
        id: number | null;
        username: string;
        password: string;
        salt: string;
        driverId: number;
    };
    static rehydrate(input: any): Account | null;
}
//# sourceMappingURL=account.entity.d.ts.map