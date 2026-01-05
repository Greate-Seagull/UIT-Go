import z from "zod";
export declare const driverPositionSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    lat: z.ZodNumber;
    long: z.ZodNumber;
}, z.core.$strip>;
export declare class DriverPosition {
    static create(input: any): DriverPosition & {
        id: number | null;
        lat: number;
        long: number;
    };
    static rehydrate(input: any): DriverPosition | null;
}
//# sourceMappingURL=driver-position.entity.d.ts.map