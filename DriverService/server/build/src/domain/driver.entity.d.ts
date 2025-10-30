export declare enum DriverState {
    READY = "READY",
    TRANSPORTING = "TRANSPORTING",
    UNAVAILABLE = "UNAVAILABLE"
}
export declare class Driver {
    private _id;
    get id(): number;
    private _state;
    get state(): DriverState;
    set state(value: DriverState);
    constructor(id: number);
    static create(id: number): Driver;
}
//# sourceMappingURL=driver.entity.d.ts.map