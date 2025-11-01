import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";
export declare class UpdatePositionUsecaseInput {
    driverId: number;
    lat: number;
    long: number;
}
export declare class UpdatePositionUsecaseOutput {
    lat: number;
    long: number;
    constructor(lat: number, long: number);
}
export declare class UpdatePositionUsecase {
    private readonly driverPositionRepository;
    constructor(driverPositionRepository: DriverPositionRepository);
    execute(input: UpdatePositionUsecaseInput): Promise<UpdatePositionUsecaseOutput>;
}
//# sourceMappingURL=update-position.usecase.d.ts.map