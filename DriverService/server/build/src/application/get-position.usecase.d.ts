import { DriverPositionRepository } from "../infrastructure/repositories/driver-position.repository";
export declare class GetPositionUsecaseInput {
    id: number;
}
export declare class GetPositionUsecaseOutput {
    lat: number;
    long: number;
    constructor(lat: number, long: number);
}
export declare class GetPositionUsecase {
    private readonly driverPositionRepository;
    constructor(driverPositionRepository: DriverPositionRepository);
    execute(input: GetPositionUsecaseInput): Promise<GetPositionUsecaseOutput>;
}
//# sourceMappingURL=get-position.usecase.d.ts.map