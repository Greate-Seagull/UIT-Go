import "dotenv/config";
import Redis from "ioredis";
import { PrismaClient } from "./generated/client/client";
import { StartAcceptingUsecase } from "./application/start-accepting.usecase";
import { DriverRepository } from "./infrastructure/repositories/driver.repository";
import { TransactionManager } from "./infrastructure/repositories/transaction";
import { AcceptTripUsecase } from "./application/accept-trip.usecase";
import { UpdatePositionUsecase } from "./application/update-position.usecase";
import { DriverPositionRepository } from "./infrastructure/repositories/driver-position.repository";
import { CompleteTripUsecase } from "./application/complete-trip.usecase";

export const prisma = new PrismaClient();
export const redis = new Redis();

const transaction = new TransactionManager(prisma);
const driverRepository = new DriverRepository(prisma);
const driverPositionRepository = new DriverPositionRepository(redis);

export const startAcceptingUsecase = new StartAcceptingUsecase(
	driverRepository,
	transaction
);
export const acceptTripUsecase = new AcceptTripUsecase(
	driverRepository,
	transaction
);
export const updatePositionUsecase = new UpdatePositionUsecase(
	driverPositionRepository
);
export const completeTripUsecase = new CompleteTripUsecase(
	driverRepository,
	transaction
);
