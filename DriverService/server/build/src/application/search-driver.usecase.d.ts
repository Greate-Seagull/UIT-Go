import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";
export declare class SearchDriverUsecaseInput {
    lat: number;
    lng: number;
    radiusMeters: number;
    limit: number;
}
export declare class SearchDriverUsecaseOutput {
    driverId: number;
    lat: number;
    long: number;
    constructor(driverId: number, lat: number, long: number);
}
export declare class SearchDriverUsecase {
    private readonly driverPositionRepository;
    constructor(driverPositionRepository: DriverPositionRepository);
    execute(input: SearchDriverUsecaseInput): Promise<any>;
}
//# sourceMappingURL=search-driver.usecase.d.ts.map