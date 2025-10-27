import { PrismaClient } from "./generated/client/client";
import { StartAcceptingUsecase } from "./application/start-accepting.usecase";
import { DriverRepository } from "./infrastructure/repositories/driver.repository";
import { TransactionManager } from "./infrastructure/repositories/transaction";

export const prisma = new PrismaClient();

const transaction = new TransactionManager(prisma);
const driverRepository = new DriverRepository(prisma);
export const startAcceptingUsecase = new StartAcceptingUsecase(
	driverRepository,
	transaction
);
