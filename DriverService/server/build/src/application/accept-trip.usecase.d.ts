import { DriverState } from "../domain/driver.entity";
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
    private readonly transactionManager;
    constructor(driverRepository: DriverRepository, transactionManager: TransactionManager);
    execute(input: AcceptTripUsecaseInput): Promise<AcceptTripUsecaseOutput>;
}
//# sourceMappingURL=accept-trip.usecase.d.ts.map