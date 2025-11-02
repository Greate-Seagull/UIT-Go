import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
export declare class RejectTripUsecaseInput {
    driverId: number;
    offerId: number;
}
export declare class RejectTripUsecaseOutput {
}
export declare class RejectTripUsecase {
    private readonly driverRepository;
    private readonly tripApiClient;
    constructor(driverRepository: DriverRepository, tripApiClient: TripApiClient);
    execute(input: RejectTripUsecaseInput): Promise<RejectTripUsecaseOutput>;
}
//# sourceMappingURL=reject-trip.usecase.d.ts.map