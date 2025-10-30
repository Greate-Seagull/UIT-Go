import { DriverState } from "../domain/driver.entity";
import { DriverRepository } from "../infrastructure/repositories/driver.repository";
import { TransactionManager } from "../infrastructure/repositories/transaction";
export declare class StartAcceptingUsecaseInput {
    id: number;
}
export declare class StartAcceptingUsecaseOutput {
    state: DriverState;
    constructor(state: DriverState);
}
export declare class StartAcceptingUsecase {
    private driverRepository;
    private transactionManager;
    constructor(driverRepository: DriverRepository, transactionManager: TransactionManager);
    execute(input: StartAcceptingUsecaseInput): Promise<StartAcceptingUsecaseOutput>;
}
//# sourceMappingURL=start-accepting.usecase.d.ts.map