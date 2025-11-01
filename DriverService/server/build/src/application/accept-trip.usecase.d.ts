import { DriverState } from "../domain/driver.entity";
import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
export declare class AcceptTripUsecaseInput {
    driverId: number;
    tripId: number;
}
export declare class AcceptTripUsecaseOutput {
    state: DriverState;
    constructor(state: DriverState);
}
export declare class AcceptTripUsecase {
    private readonly driverRepository;
    private readonly tripApiClient;
    private readonly transactionManager;
    constructor(driverRepository: DriverRepository, tripApiClient: TripApiClient, transactionManager: TransactionManager);
    execute(input: AcceptTripUsecaseInput): Promise<AcceptTripUsecaseOutput>;
}
//# sourceMappingURL=accept-trip.usecase.d.ts.map