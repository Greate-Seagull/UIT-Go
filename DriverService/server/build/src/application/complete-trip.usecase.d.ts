import { DriverState } from "../domain/entities/driver.entity";
import { TripApiClient } from "../infrastructure/clients/trip.client";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
export declare class CompleteTripUsecaseInput {
    authId: number;
    userId: number;
    tripId: number;
}
export declare class CompleteTripUsecaseOutput {
    state: DriverState;
    constructor(state: DriverState);
}
export declare class CompleteTripUsecase {
    private readonly driverRepository;
    private readonly tripApiClient;
    private readonly transactionManager;
    constructor(driverRepository: DriverRepository, tripApiClient: TripApiClient, transactionManager: TransactionManager);
    execute(input: CompleteTripUsecaseInput): Promise<CompleteTripUsecaseOutput>;
}
//# sourceMappingURL=complete-trip.usecase.d.ts.map