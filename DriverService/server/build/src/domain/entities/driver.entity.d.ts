import z from "zod";
export declare enum DriverState {
    READY = "READY",
    TRANSPORTING = "TRANSPORTING",
    UNAVAILABLE = "UNAVAILABLE"
}
export declare const driverSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    state: z.ZodDefault<z.ZodString>;
    name: z.ZodString;
    licensePlate: z.ZodString;
}, z.core.$strip>;
export declare class Driver {
    static create(input: any): Driver & {
        id: number | null;
        state: string;
        name: string;
        licensePlate: string;
    };
    static rehydrate(input: any): Driver | null;
}
//# sourceMappingURL=driver.entity.d.ts.map