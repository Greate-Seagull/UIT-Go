import { DriverState } from "../domain/driver.entity";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
export declare class CompleteTripUsecaseInput {
    driverId: number;
    userId: number;
    tripId: number;
}
export declare class CompleteTripUsecaseOutput {
    state: DriverState;
    constructor(state: DriverState);
}
export declare class CompleteTripUsecase {
    private readonly driverRepository;
    private readonly transactionManager;
    constructor(driverRepository: DriverRepository, transactionManager: TransactionManager);
    execute(input: CompleteTripUsecaseInput): Promise<CompleteTripUsecaseOutput>;
}
//# sourceMappingURL=complete-trip.usecase.d.ts.map